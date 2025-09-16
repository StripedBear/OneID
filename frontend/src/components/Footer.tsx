"use client";

export default function Footer() {
  return (
    <footer className="bg-slate-800 border-t border-slate-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">OneID</h3>
            <p className="text-slate-400 text-sm">
              Living Contact Book - DNS for People
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Contacts */}
              <div>
                <h4 className="text-white font-medium mb-3">Contacts</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Support
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Feedback
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Community
                    </a>
                  </li>
                </ul>
              </div>

              {/* About */}
              <div>
                <h4 className="text-white font-medium mb-3">About</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Our Story
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Team
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Mission
                    </a>
                  </li>
                </ul>
              </div>

              {/* FAQ */}
              <div>
                <h4 className="text-white font-medium mb-3">FAQ</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Getting Started
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Common Questions
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Troubleshooting
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-white font-medium mb-3">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Cookie Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-6">
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} OneID. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
