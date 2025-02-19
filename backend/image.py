from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import base64
import io
from PIL import Image
import numpy as np
from mainmodel1 import predict_subtype_with_heatmap

router = APIRouter()

# Configure upload directory
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/upload")
async def upload_and_predict(file: UploadFile = File(...)):
    try:
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Get prediction and heatmap
        predicted_subtype, confidence, heatmap = predict_subtype_with_heatmap(file_path)
        
        with open(file_path, "rb") as image_file:
            original_image_str = base64.b64encode(image_file.read()).decode()
        
        # Normalize heatmap and convert to base64
        heatmap = np.uint8(255 * heatmap)
        heatmap = Image.fromarray(heatmap)
        buffered = io.BytesIO()
        heatmap.save(buffered, format="PNG")
        heatmap_str = base64.b64encode(buffered.getvalue()).decode()

        return {
            "filename": file.filename,
            "predicted_subtype": predicted_subtype,
            "confidence": f"{confidence:.2f}%",
            "heatmap": f"data:image/png;base64,{heatmap_str}",
            "original_image": f"data:image/png;base64,{original_image_str}"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/list")
async def list_images():
    try:
        files = os.listdir(UPLOAD_DIR)
        return {"images": files}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
