"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Trash2, Plus, Save, Globe, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { siteSettings, updateSiteSettings } = useAdminStore();
  const [hero, setHero] = useState({ ...siteSettings.hero });
  const [footer, setFooter] = useState({
    ...siteSettings.footer,
    links: [...siteSettings.footer.links],
    social: { ...siteSettings.footer.social },
  });

  const handleHeroFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setHero({ ...hero, image: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const handleSave = () => {
    updateSiteSettings({ hero, footer });
    toast.success("Settings saved successfully!");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your homepage content and footer.
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2 shadow-sm">
          <Save size={16} />
          Save Changes
        </Button>
      </div>

      {/* Hero section */}
      <Card>
        <CardHeader>
          <CardTitle>Homepage Hero Banner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Image preview + upload */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full sm:w-48 aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
              {hero.image ? (
                <img
                  src={hero.image}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <ImageIcon size={28} />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <Input
                value={hero.image}
                onChange={(e) => setHero({ ...hero, image: e.target.value })}
                placeholder="https://..."
              />
              <p className="text-xs text-gray-400">or</p>
              <label className="flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline">
                <ImageIcon size={14} />
                Upload from device
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headline
            </label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              value={hero.title}
              onChange={(e) => setHero({ ...hero, title: e.target.value })}
              placeholder="Your main headline..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle
            </label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              value={hero.subtitle}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <Input
                value={hero.ctaText}
                onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
                placeholder="Shop the Collection"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Link
              </label>
              <Input
                value={hero.ctaLink}
                onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })}
                placeholder="/products"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              About Text
            </label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              value={footer.about}
              onChange={(e) => setFooter({ ...footer, about: e.target.value })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Navigation Links
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFooter({
                    ...footer,
                    links: [...footer.links, { title: "New Link", url: "#" }],
                  })
                }
                className="h-7 text-xs gap-1"
              >
                <Plus size={12} /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {footer.links.map((link, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100"
                >
                  <Input
                    value={link.title}
                    onChange={(e) => {
                      const links = [...footer.links];
                      links[idx] = { ...links[idx], title: e.target.value };
                      setFooter({ ...footer, links });
                    }}
                    placeholder="Link title"
                    className="bg-white text-sm"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      const links = [...footer.links];
                      links[idx] = { ...links[idx], url: e.target.value };
                      setFooter({ ...footer, links });
                    }}
                    placeholder="URL"
                    className="bg-white text-sm"
                  />
                  <button
                    onClick={() =>
                      setFooter({
                        ...footer,
                        links: footer.links.filter((_, i) => i !== idx),
                      })
                    }
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Globe size={14} className="text-gray-400" />
              Social Media Links
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["instagram", "twitter", "facebook"] as const).map((platform) => (
                <div key={platform}>
                  <label className="text-xs text-gray-400 capitalize block mb-1">
                    {platform}
                  </label>
                  <Input
                    value={footer.social[platform]}
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        social: { ...footer.social, [platform]: e.target.value },
                      })
                    }
                    placeholder="https://..."
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save again at bottom */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2 shadow-sm">
          <Save size={16} />
          Save Changes
        </Button>
      </div>
    </motion.div>
  );
}
