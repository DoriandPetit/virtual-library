import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const BarcodeScanner = ({ onScanSuccess, onScanFailure }) => {
    const scannerRef = useRef(null);

    useEffect(() => {
        // Create instance
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText, decodedResult) => {
                // Handle success
                onScanSuccess(decodedText, decodedResult);
                // Optionally clear scanner after success if desired, 
                // but typically we let parent handle unmounting
            },
            (error) => {
                // Handle failure (scanning in progress...)
                if (onScanFailure) onScanFailure(error);
            }
        );

        scannerRef.current = scanner;

        // Cleanup
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, []);

    return (
        <div style={{ width: '100%', marginBottom: '1rem' }}>
            <div id="reader" style={{ width: '100%' }}></div>
        </div>
    );
};

export default BarcodeScanner;
