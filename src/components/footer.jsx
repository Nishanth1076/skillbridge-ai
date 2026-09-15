function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} SkillBridge AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;