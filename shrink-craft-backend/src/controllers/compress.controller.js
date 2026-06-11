import sharp from "sharp";
import JSZip from "jszip";

export const compressImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const quality = parseInt(req.body.quality) || 75;
    const zip = new JSZip();
    const metrics = [];

    for (const file of req.files) {
      const compressedBuffer = await sharp(file.buffer)
        .jpeg({ quality, force: false })
        .png({ quality, force: false })
        .webp({ quality, force: false })
        .toBuffer();

      // Add file buffer into zip bundle map
      zip.file(file.originalname, compressedBuffer);

      // NEW DETAIL: Push base64 data for EACH specific file to enable single downloads on client side
      metrics.push({
        name: file.originalname,
        realCompressedSize: compressedBuffer.length,
        base64Data: compressedBuffer.toString("base64") 
      });
    }

    const zipBuffer = await zip.generateAsync({ 
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 }
    });

    const base64Zip = zipBuffer.toString("base64");

    return res.status(200).json({
      metrics,
      zipData: base64Zip
    });

  } catch (error) {
    console.error("Server processing error:", error);
    res.status(500).json({ message: "Failed to compress images." });
  }
};