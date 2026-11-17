// Vipin Gupta — Resume PDF Generator
document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('download-pdf-btn');
    if (!downloadBtn) return;

    downloadBtn.addEventListener('click', () => {
        const element = document.querySelector('.resume-container');
        if (!element || typeof html2pdf === 'undefined') return;

        const originalFontSize = document.documentElement.style.fontSize;
        const originalShadow = element.style.boxShadow;
        const originalBorder = element.style.border;
        const originalPadding = element.style.padding;

        // Compact mode for clean A4 single page export
        document.documentElement.style.fontSize = '12.5px';
        element.style.boxShadow = 'none';
        element.style.border = 'none';
        element.style.padding = '10px 16px';

        const opt = {
            margin:       [0.2, 0.2, 0.2, 0.2],
            filename:     'Vipin-Gupta-Resume.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2.5, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        const resetStyles = () => {
            document.documentElement.style.fontSize = originalFontSize;
            element.style.boxShadow = originalShadow;
            element.style.border = originalBorder;
            element.style.padding = originalPadding;
        };

        html2pdf().set(opt).from(element).save().then(resetStyles).catch((err) => {
            resetStyles();
            console.error('Error generating PDF:', err);
            alert('PDF download could not complete. You can also click "Save as PDF / Print" to save directly from your browser.');
        });
    });
});
