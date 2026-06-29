"use client";

import { FaInstagram, FaTwitter, FaFacebookF, FaTiktok } from "react-icons/fa";
import { useAdminStore } from "@/store/useAdminStore";
import Link from "next/link";

export default function Footer() {
  const { siteSettings } = useAdminStore();
  const { footer } = siteSettings;
  const half = Math.ceil(footer.links.length / 2);

  return (
    <footer className="bg-white border-t border-pink-100 pt-14 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="text-2xl font-serif font-bold text-rosegold tracking-wide"
            >
              Mailand
            </Link>
            <p className="text-gray-500 text-sm mt-4 max-w-xs leading-relaxed">
              {footer.about}
            </p>
            <div className="flex space-x-3 mt-6">
              {footer.social.instagram && footer.social.instagram !== "#" && (
                <a
                  href={footer.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <FaInstagram size={15} />
                </a>
              )}
              {footer.social.twitter && footer.social.twitter !== "#" && (
                <a
                  href={footer.social.twitter}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                  className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <FaTwitter size={15} />
                </a>
              )}
              {footer.social.facebook && footer.social.facebook !== "#" && (
                <a
                  href={footer.social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <FaFacebookF size={15} />
                </a>
              )}
              {footer.social.tiktok && footer.social.tiktok !== "#" && (
                <a
                  href={footer.social.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <FaTiktok size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Links col 1 */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 tracking-widest uppercase mb-5">
              Discover
            </h3>
            <ul className="space-y-3">
              {footer.links.slice(0, half).map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.url}
                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links col 2 */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 tracking-widest uppercase mb-5">
              Support
            </h3>
            <ul className="space-y-3">
              {footer.links.slice(half).map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.url}
                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Returns &amp; Refunds
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-pink-50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Mailand Cosmetics. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            GoOnline · EG · Made with GoOnline
          </p>
        </div>
      </div>
    </footer>
  );
}
