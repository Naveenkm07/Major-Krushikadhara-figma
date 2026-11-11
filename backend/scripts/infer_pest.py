"""
YOLO11s TFLite Crop Pest Inference Script
Called from Node.js backend via child_process.
Usage: python infer_pest.py <image_path>
Output: JSON with detections to stdout.
"""
import sys
import os
import json
import struct
import zipfile
import numpy as np
from PIL import Image

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
    except:
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
    
    # Try tflite_runtime first (lighter), then full tensorflow
    try:
        import tflite_runtime.interpreter as tflite
        interpreter = tflite.Interpreter(model_path=MODEL_PATH)
    except ImportError:
        import tensorflow as tf
        interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
    
    interpreter.allocate_tensors()
    return interpreter

# ---------------------------------------------------------------------------
# 3. Preprocessing
# ---------------------------------------------------------------------------
def preprocess_image(image_path: str) -> tuple:
    """Load image, resize directly to 640x640, normalize to [0,1] float32 in NCHW format."""
    img = Image.open(image_path).convert('RGB')
    orig_w, orig_h = img.size
    
    # Direct resize (matches YOLO export without padding artifact suppression)
    img_resized = img.resize((INPUT_SIZE, INPUT_SIZE), Image.BILINEAR)
    
    # Convert to numpy float32 [0, 1]
    img_array = np.array(img_resized, dtype=np.float32) / 255.0
    img_array = np.transpose(img_array, (2, 0, 1))  # [3, 640, 640] NCHW
    img_array = np.expand_dims(img_array, axis=0)    # [1, 3, 640, 640]
    
    return img_array, (orig_w, orig_h), (0, 0), 1.0

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

def postprocess(output, conf_threshold=0.25, iou_threshold=0.45):
    """
    Process YOLO output tensor.
    YOLO TFLite output shape: [1, num_classes+4, num_detections] or [1, num_detections, num_classes+4]
    """
    output = output[0]  # Remove batch dim
    
    # YOLO11 TFLite output is [4+num_classes, num_detections], need to transpose
    if output.shape[0] < output.shape[1]:
        output = output.T  # Now [num_detections, 4+num_classes]
    
    num_classes = output.shape[1] - 4
    
    # Extract boxes (cx, cy, w, h) and class scores
    boxes_cxcywh = output[:, :4]
    class_scores = output[:, 4:]
    
    # Get max class score and class ID per detection
    max_scores = np.max(class_scores, axis=1)
    class_ids = np.argmax(class_scores, axis=1)
    
    # Filter by confidence
    mask = max_scores >= conf_threshold
    boxes_cxcywh = boxes_cxcywh[mask]
    max_scores = max_scores[mask]
    class_ids = class_ids[mask]
    
    if len(boxes_cxcywh) == 0:
        return []
    
    # Convert cx,cy,w,h to x1,y1,x2,y2
    boxes_xyxy = np.zeros_like(boxes_cxcywh)
    boxes_xyxy[:, 0] = boxes_cxcywh[:, 0] - boxes_cxcywh[:, 2] / 2
    boxes_xyxy[:, 1] = boxes_cxcywh[:, 1] - boxes_cxcywh[:, 3] / 2
    boxes_xyxy[:, 2] = boxes_cxcywh[:, 0] + boxes_cxcywh[:, 2] / 2
    boxes_xyxy[:, 3] = boxes_cxcywh[:, 1] + boxes_cxcywh[:, 3] / 2
    
    # NMS
    keep = nms(boxes_xyxy, max_scores, iou_threshold)
    
    detections = []
    for i in keep:
        class_id = int(class_ids[i])
        detections.append({
            'class_id': class_id,
            'class_name': CLASS_NAMES.get(class_id, f'class_{class_id}'),
            'confidence': round(float(max_scores[i]) * 100, 1),
            'bbox': [float(boxes_xyxy[i, j]) for j in range(4)],
        })
    
    # Sort by confidence descending
    detections.sort(key=lambda d: d['confidence'], reverse=True)
    
    # Return top 5
    return detections[:5]

# ---------------------------------------------------------------------------
# 5. Main Inference
# ---------------------------------------------------------------------------
def run_inference(image_path: str) -> dict:
    """Run YOLO pest detection on a single image."""
    if not os.path.isfile(image_path):
        return {'success': False, 'error': f'Image not found: {image_path}'}
    
    try:
        interp = get_interpreter()
        input_details = interp.get_input_details()
        output_details = interp.get_output_details()
        
        # Preprocess
        img_array, orig_size, padding, scale = preprocess_image(image_path)
        
        # Set input tensor
        interp.set_tensor(input_details[0]['index'], img_array)
        
        # Run inference
        interp.invoke()
        
        # Get output
        output = interp.get_tensor(output_details[0]['index'])
        
        # Postprocess
        detections = postprocess(output, conf_threshold=0.20)
        
        if not detections:
            return {
                'success': True,
                'detections': [],
                'primary': None,
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
        return {'success': False, 'error': str(e)}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'Usage: python infer_pest.py <image_path>'}))
        sys.exit(1)
    
    result = run_inference(sys.argv[1])
    print(json.dumps(result, ensure_ascii=False))

