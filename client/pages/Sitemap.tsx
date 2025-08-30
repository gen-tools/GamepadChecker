export default function Sitemap() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Website Sitemap</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Testing Tools</h2>
          <ul className="space-y-2">
            <li><a href="/gamepad-tester" className="text-blue-600 hover:underline">Gamepad Tester</a></li>
            <li><a href="/gpu-tester" className="text-blue-600 hover:underline">GPU Tester</a></li>
            <li><a href="/mic-tester" className="text-blue-600 hover:underline">Microphone Tester</a></li>
            <li><a href="/midi-tester" className="text-blue-600 hover:underline">MIDI Tester</a></li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Company</h2>
          <ul className="space-y-2">
            <li><a href="/about" className="text-blue-600 hover:underline">About Us</a></li>
            <li><a href="/contact" className="text-blue-600 hover:underline">Contact</a></li>
            <li><a href="/blog" className="text-blue-600 hover:underline">Blog</a></li>
            <li><a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a></li>
            <li><a href="/sitemap" className="text-blue-600 hover:underline">HTML Sitemap</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}