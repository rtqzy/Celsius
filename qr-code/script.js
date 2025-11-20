const generateBtn = document.getElementById('generateQR');
const qrInput = document.getElementById('qrInput');
const qrCanvas = document.getElementById('qrCanvas');

generateBtn.addEventListener('click', () => {
    const text = qrInput.value.trim();
    if (!text) return alert("Please enter text or URL");

    // Clear previous QR
    const ctx = qrCanvas.getContext('2d');
    ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);

    // Generate QR in a temporary div
    const tempDiv = document.createElement('div');
    const qr = new QRCode(tempDiv, {
        text: text,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(() => {
        const img = tempDiv.querySelector('img');
        if (img) {
            qrCanvas.width = img.width;
            qrCanvas.height = img.height + 20; // space for watermark
            const ctx = qrCanvas.getContext('2d');
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);
            ctx.drawImage(img, 0, 0);

            // Add watermark
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Made with CelciusBot.com", qrCanvas.width / 2, qrCanvas.height - 5);
        }
    }, 100);
});
