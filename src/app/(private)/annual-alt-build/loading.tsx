import Preloader from "@/components/ui/Preloader/Preloader";

export default function Loading() {
    return (
        <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        }}>
            <Preloader />
        </div>
    );
}
