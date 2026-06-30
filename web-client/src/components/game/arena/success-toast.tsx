interface SuccessToastProps {
    isVisible: boolean;
}

export const SuccessToast = ({ isVisible }: SuccessToastProps) => {
    if (!isVisible) return null;

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]">
            <div className="bg-paper-white border-[6px] border-deep-ink neubrutal-shadow p-xl text-center transform rotate-3">
                <h3 className="font-display-lg text-[64px] text-primary leading-none mb-sm">
                    BINGO!
                </h3>
                <p className="font-headline-md text-headline-md uppercase">
                    ROUND IS CORRECT
                </p>
                <div className="mt-md text-label-bold font-label-bold bg-sky-blue border-2 border-deep-ink p-sm">
                    +450 POINTS EARNED
                </div>
            </div>
        </div>
    );
};
