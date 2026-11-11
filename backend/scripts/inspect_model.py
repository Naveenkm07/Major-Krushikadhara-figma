"""Inspect the YOLOv8 TFLite model metadata."""
import struct, json, zipfile, os, sys

model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'best.tflite')

# Method 1: Try reading as zip (TFLite models with metadata are sometimes zipped)
try:
    with zipfile.ZipFile(model_path, 'r') as zf:
        print("ZIP contents:", zf.namelist())
        for name in zf.namelist():
            if name.endswith('.json') or name.endswith('.txt') or 'metadata' in name.lower():
                print(f"\n--- {name} ---")
                print(zf.read(name).decode('utf-8', errors='replace'))
except:
    pass

# Method 2: Search binary for JSON metadata
with open(model_path, 'rb') as f:
    data = f.read()

text = data.decode('latin-1')

# Look for JSON with 'names' key (YOLO stores class names here)
# Search from the end where metadata usually sits
for search_start in [len(text)-50000, 0]:
    idx = text.find('"names"', max(0, search_start))
    while idx != -1:
        # Try to find the enclosing JSON object
        brace_start = text.rfind('{', max(0, idx-500), idx)
        if brace_start != -1:
            depth = 0
            for i in range(brace_start, min(len(text), brace_start+10000)):
                if text[i] == '{': depth += 1
                elif text[i] == '}': depth -= 1
                if depth == 0:
                    candidate = text[brace_start:i+1]
                    try:
                        meta = json.loads(candidate)
                        print("\nYOLO METADATA FOUND:")
                        print(json.dumps(meta, indent=2, ensure_ascii=False))
                        sys.exit(0)
                    except json.JSONDecodeError:
                        pass
                    break
        idx = text.find('"names"', idx+1)

# Method 3: Try tflite_runtime
try:
    import tflite_runtime.interpreter as tflite
    interp = tflite.Interpreter(model_path=model_path)
    interp.allocate_tensors()
    inp = interp.get_input_details()
    out = interp.get_output_details()
    print("\nINPUT DETAILS:", json.dumps([{k:str(v) for k,v in d.items()} for d in inp], indent=2))
    print("\nOUTPUT DETAILS:", json.dumps([{k:str(v) for k,v in d.items()} for d in out], indent=2))
except ImportError:
    pass

# Method 4: Try full tensorflow
try:
    import tensorflow as tf
    interp = tf.lite.Interpreter(model_path=model_path)
    interp.allocate_tensors()
    inp = interp.get_input_details()
    out = interp.get_output_details()
    print("\nINPUT DETAILS:", json.dumps([{k:str(v) for k,v in d.items()} for d in inp], indent=2))
    print("\nOUTPUT DETAILS:", json.dumps([{k:str(v) for k,v in d.items()} for d in out], indent=2))
except ImportError:
    print("\nNeither tflite_runtime nor tensorflow available for tensor inspection")

