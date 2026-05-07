import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaPinterestP, FaYoutube } from 'react-icons/fa';
import { Ghost, Music2, X } from 'lucide-react';

const socialLinks = [
  { Icon: FaFacebookF, href: '#', label: 'Facebook' },
  { Icon: FaInstagram, href: '#', label: 'Instagram' },
  { Icon: FaPinterestP, href: '#', label: 'Pinterest' },
  { Icon: Music2, href: '#', label: 'TikTok' },
  { Icon: Ghost, href: '#', label: 'Snapchat' },
  { Icon: FaYoutube, href: '#', label: 'YouTube' },
  { Icon: X, href: '#', label: 'X' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#232323] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_2.35fr] lg:gap-12">
        <div>
          <h4 className="mb-5 font-body text-[15px] font-black uppercase tracking-[0.08em] text-white">
            Contact Us
          </h4>
          <address className="space-y-3 font-body text-[11px] font-semibold leading-relaxed text-[#c7c7c7] not-italic">
            <p>15-Km, Hafizabad Road, Adjacent</p>
            <p>Qila Marriage Hall, Qila Didar Singh,</p>
            <p>Gujranwala</p>
            <p>
              <a href="mailto:customercare@mavish.com" className="transition-colors hover:text-white">
                Customercare@Mavish.com
              </a>
            </p>
            <p>+92 300 100 3187 (WhatsApp Chat</p>
            <p>Only)</p>
          </address>
        </div>

        <div>
          <h4 className="mb-5 font-body text-[15px] font-black uppercase tracking-[0.08em] text-white">
            Customer Care
          </h4>
          <ul className="space-y-3 font-body text-[11px] font-semibold text-[#c7c7c7]">
            {['Return And Exchange', 'FAQs', 'Contact Us'].map((item) => (
              <li key={item}>
                <Link
                  to={item === 'Return And Exchange' ? '/return-exchange'
                    : item === 'FAQs' ? '/faqs'
                    : '#'}
                  className="transition-colors hover:text-white">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-5 font-body text-[15px] font-black uppercase tracking-[0.08em] text-white">
            Information
          </h4>
          <ul className="space-y-3 font-body text-[11px] font-semibold text-[#c7c7c7]">
{['About Us', 'Privacy Policy', 'Terms Of Service', 'Payments'].map((item) => (
              <li key={item}>
                <Link
                  to={
                    item === 'About Us'
                      ? '/about-us'
                      : item === 'Terms Of Service'
                        ? '/terms-of-service'
                        : item === 'Privacy Policy'
                          ? '/privacy-policy'
                            : item === 'Payments'
                            ? '/payment'
                            : '/'
                  }
                  className="transition-colors hover:text-white"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-body text-[15px] font-black uppercase tracking-[0.08em] text-white">
            Newsletter Sign Up
          </h4>
          <p className="mb-3 font-body text-[11px] font-semibold text-[#c7c7c7]">
            Sign up for exclusive updates, new arrivals & insider only discounts
          </p>

          {submitted ? (
            <p className="font-body text-[11px] font-semibold text-white">Thank you for subscribing!</p>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_150px]">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email address"
                className="h-[54px] min-w-0 border border-white bg-transparent px-4 font-body text-[11px] font-semibold text-white placeholder:text-[#c7c7c7] focus:outline-none"
              />
              <button
                type="submit"
                className="h-[54px] bg-white px-6 font-body text-[13px] font-black uppercase tracking-[0.08em] text-[#232323] transition-colors hover:bg-neutral-100"
              >
                Submit
              </button>
            </form>
          )}

          <div className="mt-7 flex flex-wrap gap-4">
            {socialLinks.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#232323] transition-colors hover:bg-neutral-200"
              >
                <Icon size={label === 'X' ? 15 : 13} strokeWidth={label === 'X' ? 1.8 : undefined} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#2d2d2d]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-4 sm:px-8 md:flex-row">
          <p className="font-body text-[12px] font-semibold tracking-[0.02em] text-white">
            Copyright © Mavish Boutique | All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <div className="flex h-8 w-12 items-center justify-center rounded bg-white text-[14px] font-black italic text-[#172e91]">
              VISA
            </div>
            <div className="relative flex h-8 w-12 items-center justify-center rounded bg-white">
              <span className="h-[18px] w-[18px] rounded-full bg-[#eb001b]" />
              <span className="-ml-2 h-[18px] w-[18px] rounded-full bg-[#f79e1b] opacity-95" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
