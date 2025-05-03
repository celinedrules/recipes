import "./Footer.scss";

const Footer = () => {
    return (
        <footer className="footer">
            <p>Delicious recipes at your fingertips.</p>
            <p>© {new Date().getFullYear()} BitWave Labs. All rights reserved.</p>
        </footer>
    );
};

export default Footer;