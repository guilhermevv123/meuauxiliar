import { useEffect, useRef } from 'react';

interface PhoneMockupProps {
    videoSrc: string;
    className?: string;
}

const PhoneMockup = ({ videoSrc, className = '' }: PhoneMockupProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Ensure video plays on mount
        if (videoRef.current) {
            videoRef.current.play().catch(err => {
                console.log('Video autoplay prevented:', err);
            });
        }
    }, []);

    return (
        <div className={`relative w-full ${className}`}>
            {/* iPhone Mockup Container - Cropped with stronger fade */}
            <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px] max-h-[480px] sm:max-h-[520px] overflow-hidden">
                {/* Subtle Gradient Fade Overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-36 bg-gradient-to-t from-background via-background/85 to-transparent z-20 pointer-events-none" />

                {/* iPhone Frame - Rounded top only */}
                <div className="relative bg-black rounded-t-[3rem] p-3 shadow-2xl">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-black rounded-b-3xl z-10" />

                    {/* Screen Content */}
                    <div className="relative bg-white rounded-t-[2.5rem] overflow-hidden aspect-[9/19.5]">
                        <video
                            ref={videoRef}
                            src={videoSrc}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Side Buttons */}
                    <div className="absolute right-0 top-28 w-1 h-14 bg-black/40 rounded-l" />
                    <div className="absolute left-0 top-24 w-1 h-7 bg-black/40 rounded-r" />
                    <div className="absolute left-0 top-36 w-1 h-7 bg-black/40 rounded-r" />
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 -z-10 blur-3xl opacity-25">
                    <div className="absolute inset-0 bg-gradient-purple" />
                </div>
            </div>
        </div>
    );
};

export default PhoneMockup;
