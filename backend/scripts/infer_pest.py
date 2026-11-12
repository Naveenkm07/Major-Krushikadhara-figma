"""
YOLO11s TFLite Crop Pest Inference Script
Called from Node.js backend via persistent worker (--worker) or single-shot CLI.
Usage:
  Single-shot: python infer_pest.py <image_path>
  Worker loop: python infer_pest.py --worker   (reads image path per line from stdin)
Output: Single-line JSON to stdout.
"""
import sys
import os
import json
import zipfile
import warnings

# Silence TensorFlow C++ / oneDNN / deprecation noise before importing TF
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
warnings.filterwarnings("ignore")

import numpy as np
from PIL import Image, ImageOps

# ---------------------------------------------------------------------------
# 1. Load class names from model metadata
# ---------------------------------------------------------------------------
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'best.tflite')


def load_class_names():
    """Extract class names from TFLite model ZIP metadata."""
    try:
        with zipfile.ZipFile(MODEL_PATH, 'r') as zf:
            if 'metadata.json' in zf.namelist():
                meta = json.loads(zf.read('metadata.json').decode('utf-8'))
                names = meta.get('names', {})
                return {int(k): v for k, v in names.items()}
    except Exception:
        pass
    return {}


CLASS_NAMES = load_class_names()
INPUT_SIZE = 640  # YOLO11s default

# ---------------------------------------------------------------------------
# 2. TFLite Interpreter
# ---------------------------------------------------------------------------
interpreter = None


def get_interpreter():
    global interpreter
    if interpreter is not None:
        return interpreter

    try:
        import ai_edge_litert.interpreter as tflite
        interpreter = tflite.Interpreter(model_path=MODEL_PATH)
    except ImportError:
        try:
            import tflite_runtime.interpreter as tflite
            interpreter = tflite.Interpreter(model_path=MODEL_PATH)
        except ImportError:
            import tensorflow as tf
            try:
                tf.get_logger().setLevel('ERROR')
            except Exception:
                pass
            interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)

    interpreter.allocate_tensors()
    return interpreter


# ---------------------------------------------------------------------------
# 3. Preprocessing (EXIF Transpose + Ultralytics Letterbox 640x640)
# ---------------------------------------------------------------------------
def preprocess_image(image_path: str) -> tuple:
    """Fix EXIF orientation, apply aspect-preserving 640x640 letterbox (114,114,114), and convert to NCHW float32 [0,1]."""
    with Image.open(image_path) as raw_img:
        img = ImageOps.exif_transpose(raw_img).convert('RGB')
        orig_w, orig_h = img.size

        scale = min(INPUT_SIZE / float(orig_w), INPUT_SIZE / float(orig_h))
        new_w = max(1, int(round(orig_w * scale)))
        new_h = max(1, int(round(orig_h * scale)))

        pad_left = int(round((INPUT_SIZE - new_w) / 2.0 - 0.1))
        pad_top = int(round((INPUT_SIZE - new_h) / 2.0 - 0.1))

        img_resized = img.resize((new_w, new_h), Image.BILINEAR)
        canvas = Image.new('RGB', (INPUT_SIZE, INPUT_SIZE), (114, 114, 114))
        canvas.paste(img_resized, (pad_left, pad_top))

    img_array = np.array(canvas, dtype=np.float32) / 255.0
    img_array = np.transpose(img_array, (2, 0, 1))  # [3, 640, 640] NCHW
    img_array = np.expand_dims(img_array, axis=0)    # [1, 3, 640, 640]

    return img_array, (orig_w, orig_h), (pad_left, pad_top), (new_w, new_h)


# ---------------------------------------------------------------------------
# 4. Postprocessing (YOLO NMS)
# ---------------------------------------------------------------------------
def nms(boxes, scores, iou_threshold=0.45):
    """Non-Maximum Suppression."""
    if len(boxes) == 0:
        return []

    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 2]
    y2 = boxes[:, 3]
    areas = (x2 - x1) * (y2 - y1)

    order = scores.argsort()[::-1]
    keep = []

    while len(order) > 0:
        i = order[0]
        keep.append(i)

        if len(order) == 1:
            break

        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])

        w = np.maximum(0.0, xx2 - xx1)
        h = np.maximum(0.0, yy2 - yy1)
        inter = w * h

        iou = inter / (areas[i] + areas[order[1:]] - inter + 1e-6)
        inds = np.where(iou <= iou_threshold)[0]
        order = order[inds + 1]

    return keep


def postprocess(output, pad=(0, 0), scaled_size=(INPUT_SIZE, INPUT_SIZE), conf_threshold=0.22, iou_threshold=0.45):
    """Process YOLO output tensor and un-letterbox normalized coordinates to original image space."""
    output = output[0]  # Remove batch dim

    # YOLO11 TFLite output is [4+num_classes, num_detections], transpose to [num_detections, 4+num_classes]
    if output.shape[0] < output.shape[1]:
        output = output.T

    boxes_cxcywh = output[:, :4]
    class_scores = output[:, 4:]

    max_scores = np.max(class_scores, axis=1)
    class_ids = np.argmax(class_scores, axis=1)

    mask = max_scores >= conf_threshold
    boxes_cxcywh = boxes_cxcywh[mask]
    max_scores = max_scores[mask]
    class_ids = class_ids[mask]

    if len(boxes_cxcywh) == 0:
        return []

    boxes_xyxy = np.zeros_like(boxes_cxcywh)
    boxes_xyxy[:, 0] = boxes_cxcywh[:, 0] - boxes_cxcywh[:, 2] / 2
    boxes_xyxy[:, 1] = boxes_cxcywh[:, 1] - boxes_cxcywh[:, 3] / 2
    boxes_xyxy[:, 2] = boxes_cxcywh[:, 0] + boxes_cxcywh[:, 2] / 2
    boxes_xyxy[:, 3] = boxes_cxcywh[:, 1] + boxes_cxcywh[:, 3] / 2

    keep = nms(boxes_xyxy, max_scores, iou_threshold)

    pad_left, pad_top = pad
    new_w, new_h = scaled_size

    detections = []
    for i in keep:
        class_id = int(class_ids[i])
        x1 = max(0.0, min(1.0, (float(boxes_xyxy[i, 0]) * INPUT_SIZE - pad_left) / float(new_w)))
        y1 = max(0.0, min(1.0, (float(boxes_xyxy[i, 1]) * INPUT_SIZE - pad_top) / float(new_h)))
        x2 = max(0.0, min(1.0, (float(boxes_xyxy[i, 2]) * INPUT_SIZE - pad_left) / float(new_w)))
        y2 = max(0.0, min(1.0, (float(boxes_xyxy[i, 3]) * INPUT_SIZE - pad_top) / float(new_h)))
        detections.append({
            'class_id': class_id,
            'class_name': CLASS_NAMES.get(class_id, f'class_{class_id}'),
            'confidence': round(float(max_scores[i]) * 100, 1),
            'bbox': [round(x1, 4), round(y1, 4), round(x2, 4), round(y2, 4)],
        })

    detections.sort(key=lambda d: d['confidence'], reverse=True)
    return detections[:5]


# ---------------------------------------------------------------------------
# 5. Main Inference
# ---------------------------------------------------------------------------
def run_inference(image_path: str) -> dict:
    """Run YOLO pest detection on a single image."""
    if not os.path.isfile(image_path):
        return {
            'success': False,
            'detections': [],
            'primary': None,
            'total_pests_found': 0,
            'error': f'Image not found: {image_path}',
        }

    try:
        interp = get_interpreter()
        input_details = interp.get_input_details()
        output_details = interp.get_output_details()

        img_array, _, pad, scaled_size = preprocess_image(image_path)
        interp.set_tensor(input_details[0]['index'], img_array)
        interp.invoke()

        output = interp.get_tensor(output_details[0]['index'])
        detections = postprocess(output, pad=pad, scaled_size=scaled_size, conf_threshold=0.18)

        if not detections:
            return {
                'success': True,
                'detections': [],
                'primary': None,
                'total_pests_found': 0,
                'message': 'No pests detected. The crop appears healthy.'
            }

        primary = detections[0]

        return {
            'success': True,
            'detections': detections,
            'primary': {
                'pest_name': primary['class_name'],
                'confidence': primary['confidence'],
                'class_id': primary['class_id'],
            },
            'total_pests_found': len(detections),
        }

    except Exception as e:
        return {
            'success': False,
            'detections': [],
            'primary': None,
            'total_pests_found': 0,
            'error': str(e),
        }


def run_worker():
    """Keep TensorFlow Lite interpreter hot in memory and read image paths via stdin."""
    try:
        get_interpreter()
        print(json.dumps({'ready': True, 'classes': len(CLASS_NAMES)}), flush=True)
    except Exception as e:
        print(json.dumps({'ready': False, 'error': str(e)}), flush=True)
        sys.exit(1)

    while True:
        line = sys.stdin.readline()
        if not line:
            break
        raw = line.strip().lstrip('\ufeff')
        if not raw:
            continue
        if raw.startswith('{'):
            try:
                payload = json.loads(raw)
                img_path = payload.get('imagePath', '')
            except Exception:
                img_path = raw
        else:
            img_path = raw
        res = run_inference(img_path)
        print(json.dumps(res, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'Usage: python infer_pest.py <image_path> | --worker'}))
        sys.exit(1)

    if sys.argv[1] == '--worker':
        run_worker()
    else:
        result = run_inference(sys.argv[1])
        print(json.dumps(result, ensure_ascii=False))
