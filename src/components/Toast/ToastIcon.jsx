const ToastIcon = ({ src, alt = "Notification Icon" }) => (
    <img
        src={src}
        alt={alt}
        style={{
            width: 28,
            height: 28,
            padding: 2,
            objectFit: "contain"
        }}
    />
);

export default ToastIcon;
