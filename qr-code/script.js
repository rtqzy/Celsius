const generateBtn = document.getElementById('generateQR');
const downloadBtn = document.getElementById('downloadQR');
const qrInput = document.getElementById('qrInput');
const qrCanvas = document.getElementById('qrCanvas');

generateBtn.addEventListener('click', () => {
    const text = qrInput.value.trim();
    if (!text) return alert("Please enter text or URL");

    // Clear previous QR
    const ctx = qrCanvas.getContext('2d');
    ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);

    // Generate QR in temporary div
    const tempDiv = document.createElement('div');
    new QRCode(tempDiv, {
        text: text,
        width: 300,
        height: 300,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(() => {
        const img = tempDiv.querySelector('img');
        if (img) {
            qrCanvas.width = img.width;
            qrCanvas.height = img.height + 20; // space for watermark
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);
            ctx.drawImage(img, 0, 0);

            // Watermark
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Made with CelciusBot.com", qrCanvas.width / 2, qrCanvas.height - 5);
        }
    }, 100);
});

// Download QR code as image
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = qrCanvas.toDataURL("image/png");
    link.click();
});
