import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Monitor,
  Mic,
  Music,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO, createWebsiteStructuredData, createFAQStructuredData } from '@/components/SEO';
import { useScrollAnimation, useStaggeredScrollAnimation } from '@/hooks/useScrollAnimation';

const testers = [ { name: 'Gamepad Tester', description: 'Test your gaming controllers with real-time input detection, button mapping, and vibration feedback.', icon: Gamepad2, href: '/gamepad-tester', features: ['Real-time input', 'Vibration test', 'Button mapping'], color: 'bg-blue-500', }, { name: 'GPU Tester', description: 'Analyze your graphics card performance with WebGL rendering tests and hardware information.', icon: Monitor, href: '/gpu-tester', features: ['WebGL benchmarks', 'Hardware info', 'Performance metrics'], color: 'bg-green-500', }, { name: 'Microphone Tester', description: 'Test your microphone input with real-time audio visualization and quality analysis.', icon: Mic, href: '/mic-tester', features: ['Audio visualization', 'Input levels', 'Quality analysis'], color: 'bg-red-500', }, { name: 'MIDI Tester', description: 'Test MIDI devices and keyboards with real-time signal detection and note visualization.', icon: Music, href: '/midi-tester', features: ['Device detection', 'Note visualization', 'Signal monitoring'], color: 'bg-purple-500', }, ];
const faqs = [ { question: 'How does the gamepad tester work?', answer: 'Our gamepad tester uses the Gamepad API to detect connected controllers and display real-time input data including button presses, joystick movements, and trigger values.', }, { question: 'Is my data safe when using these testers?', answer: 'Yes! All testing happens locally in your browser. We never collect, store, or transmit any of your device data or personal information.', }, { question: 'Which browsers are supported?', answer: 'Our testers work on all modern browsers including Chrome, Firefox, Safari, and Edge. Some features may require specific browser permissions.', }, ];

export default function Index() {
  const faqStructuredData = createFAQStructuredData(faqs);
  const websiteStructuredData = createWebsiteStructuredData();
  const toolsAnimation = useScrollAnimation({ threshold: 0.2 });
  const { containerRef: toolsContainerRef, visibleItems: toolsVisible } = useStaggeredScrollAnimation(4, { threshold: 0.2 });
  const featuresAnimation = useScrollAnimation({ threshold: 0.2 });
  const faqAnimation = useScrollAnimation({ threshold: 0.2 });
  const organizationStructuredData = { '@context': 'https://schema.org', '@type': 'Organization', name: 'GamepadChecker', url: 'https://gamepadchecker.com', logo: 'https://gamepadchecker.com/logo.png', description: 'The #1 professional gamepad testing tool trusted by millions worldwide.', foundingDate: '2024', contactPoint: { '@type': 'ContactPoint', contactType: 'Customer Support', email: 'support@gamepadchecker.com' }, sameAs: [ 'https://twitter.com/gamepadchecker', 'https://facebook.com/gamepadchecker' ] };
  const breadcrumbStructuredData = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gamepadchecker.com' } ] };

  return (
    <div className="flex flex-col">
      <SEO
        title="GamepadChecker - #1 Professional Controller Testing Tool | Test Xbox, PS5, PC Gamepads"
        description="GamepadChecker: Trusted by millions! Test Xbox Series X/S, PS5 DualSense, Nintendo Switch Pro & PC controllers. Real-time input detection, latency testing & performance analysis. 100% free."
        keywords="gamepadchecker, gamepad tester, controller test, xbox series x controller, ps5 dualsense test, nintendo switch pro controller, pc gamepad test, controller checker, joystick tester, gamepad latency test, hardware testing, gaming controller diagnostics"
        structuredData={[websiteStructuredData, faqStructuredData, organizationStructuredData, breadcrumbStructuredData]}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20 sm:py-32">
        <div className="absolute inset-0 overflow-hidden"><div className="animate-pulse-glow absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div><div className="animate-pulse-glow absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" style={{ animationDelay: '1s' }}></div></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-down"><span className="text-gray-700 animate-scale-in">GamepadChecker</span> Free Online Gamepad & Controller Tester</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground md:text-xl animate-fade-in-up animate-stagger-1">Professional-grade gamepad testing tool trusted by millions. Test Xbox, PlayStation, and PC controllers with instant real-time results. 100% free, no downloads required.</p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in-up animate-stagger-2">
              <Button asChild size="lg" className="gap-2 hover-lift hover-glow"><Link to="/gamepad-tester">Start Testing<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></Button>
              <Button variant="outline" size="lg" asChild className="hover-scale"><Link to="/about">Learn More</Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* All Tools Section */}
      <section className="py-16 sm:py-24" ref={toolsAnimation.ref}><div className="mx-auto max-w-7xl px-6 lg:px-8"><div className={`mx-auto max-w-2xl text-center mb-12 transition-all duration-700 ${ toolsAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8' }`}><h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-4">Choose Your Testing Tool</h2><p className="text-lg text-muted-foreground">Professional hardware testing tools for all your gaming and audio equipment</p></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto" ref={toolsContainerRef}><Link to="/gamepad-tester" className={`group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover-lift hover-glow ${ toolsVisible[0] ? 'animate-fade-in-up' : 'opacity-0 translate-y-8' }`}><div className="flex flex-col items-center text-center space-y-3"><div className="p-3 bg-gray-100 rounded-lg group-hover:scale-110 transition-transform duration-300"><Gamepad2 className="h-8 w-8 text-gray-700" /></div><h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors duration-300">Gamepad Tester</h3><p className="text-sm text-gray-600 leading-relaxed">Test controllers with real-time input detection and vibration feedback</p></div></Link><Link to="/gpu-tester" className={`group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover-lift hover-glow ${ toolsVisible[1] ? 'animate-fade-in-up animate-stagger-1' : 'opacity-0 translate-y-8' }`}><div className="flex flex-col items-center text-center space-y-3"><div className="p-3 bg-gray-100 rounded-lg group-hover:scale-110 transition-transform duration-300"><Monitor className="h-8 w-8 text-gray-600" /></div><h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors duration-300">GPU Tester</h3><p className="text-sm text-gray-600 leading-relaxed">Analyze graphics card performance with WebGL rendering tests</p></div></Link><Link to="/mic-tester" className={`group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover-lift hover-glow ${ toolsVisible[2] ? 'animate-fade-in-up animate-stagger-2' : 'opacity-0 translate-y-8' }`}><div className="flex flex-col items-center text-center space-y-3"><div className="p-3 bg-gray-100 rounded-lg group-hover:scale-110 transition-transform duration-300"><Mic className="h-8 w-8 text-gray-600" /></div><h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors duration-300">Mic Tester</h3><p className="text-sm text-gray-600 leading-relaxed">Test microphone input with real-time audio visualization</p></div></Link><Link to="/midi-tester" className={`group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover-lift hover-glow ${ toolsVisible[3] ? 'animate-fade-in-up animate-stagger-3' : 'opacity-0 translate-y-8' }`}><div className="flex flex-col items-center text-center space-y-3"><div className="p-3 bg-gray-100 rounded-lg group-hover:scale-110 transition-transform duration-300"><Music className="h-8 w-8 text-gray-600" /></div><h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors duration-300">MIDI Tester</h3><p className="text-sm text-gray-600 leading-relaxed">Test MIDI devices with real-time signal detection and visualization</p></div></Link></div></div></section>

      {/* --- THIS IS THE NEW SECTION WITH YOUR CONTENT --- */}
      <section className="py-20 sm:py-32 bg-muted/50" ref={featuresAnimation.ref}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl prose prose-lg max-w-none text-muted-foreground space-y-12">
            
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Welcome to GamepadChecker – Your All in One Online Device Testing Hub
              </h2>
              <p className="mt-6 text-lg leading-8">
                Technology is only as good as its reliability. Whether you are a gamer who wants to make sure your controller works perfectly, a musician checking your MIDI setup, or a PC enthusiast testing your graphics card, you need tools that are quick and trustworthy. At GamepadChecker, we bring you a complete suite of online testing tools that allow you to check your gamepad, GPU, microphone, and MIDI devices directly from your browser without installing anything.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Gamepad Checker and Controller Testing</h2>
              <p className="mt-4">
                If you need to check if your controller is working correctly our <Link to="/gamepad-tester" className="text-primary hover:underline font-semibold">Gamepad Tester</Link> is the tool designed for you. It instantly shows button inputs, trigger sensitivity, and joystick movement.
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-foreground mt-6">Why use an online Gamepad Checker</h3>
              <ul className="mt-4 list-disc pl-6 space-y-2">
                <li>Verify button and joystick responses in real time</li>
                <li>Detect issues with PS3 controller, PS4 controller tester, PS5 controller tester PC, and Xbox 360 controller</li>
                <li>Use an Xbox controller tester without installing drivers</li>
                <li>Access a controller checker online and joystick tester online for free</li>
              </ul>
              <p className="mt-4">
                Whether you need a basic free gamepad tester or an advanced diagnostic tool, GamepadChecker helps you identify issues instantly.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">GPU Tester – Check Your Graphics Card Online</h2>
              <p className="mt-4">
                A stable GPU is essential for gaming, video editing, and professional work. Our <Link to="/gpu-tester" className="text-primary hover:underline font-semibold">GPU Tester</Link> is a simple online solution to quickly test your GPU without complicated software.
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-foreground mt-6">What our GPU checker can do</h3>
              <ul className="mt-4 list-disc pl-6 space-y-2">
                <li>Run an online graphics card checker directly in your browser</li>
                <li>Perform a quick test GPU online for free to identify performance issues</li>
                <li>Check GPU stability under load conditions</li>
                <li>Work as a GPU checker online and a graphics card checker for multiple devices</li>
              </ul>
              <p className="mt-4">
                This tool is ideal for users who want a fast and easy way to test their graphics card without downloading large benchmarking programs.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Mic Tester – Test Your Microphone Online</h2>
              <p className="mt-4">
                Clear communication depends on a properly working microphone. With our <Link to="/mic-tester" className="text-primary hover:underline font-semibold">Mic Tester</Link> you can quickly check if your microphone is working as expected.
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-foreground mt-6">Features of the Mic Tester</h3>
              <ul className="mt-4 list-disc pl-6 space-y-2">
                <li>Real-time visualization of your microphone input</li>
                <li>Detect muted or low-volume problems instantly</li>
                <li>Works with both built-in and external microphones</li>
              </ul>
              <p className="mt-4">
                This online mic tester is perfect for streamers, gamers, and professionals who want quick confirmation that their sound input is reliable.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">MIDI Tester – For Musicians and Creators</h2>
              <p className="mt-4">
                MIDI devices are essential for music producers and creators. Our <Link to="/midi-tester" className="text-primary hover:underline font-semibold">MIDI Tester</Link> is a browser-based solution that lets you verify your MIDI devices instantly.
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-foreground mt-6">Why use our MIDI monitor online</h3>
              <ul className="mt-4 list-disc pl-6 space-y-2">
                <li>Detects connected MIDI devices automatically</li>
                <li>Works as a free MIDI tester with sound feedback</li>
                <li>Functions as a simple MIDI monitor for beginners</li>
                <li>Serves as a MIDI device tester for troubleshooting</li>
                <li>Offers a MIDI monitor online for advanced setups</li>
              </ul>
              <p className="mt-4">
                From beginners using a free MIDI monitor to professionals needing a MIDI tester with sound, our platform helps musicians ensure every key and pad is responsive.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Why Choose GamepadChecker</h2>
              <p className="mt-4">
                We designed GamepadChecker to be simple, fast, and free. Unlike other tools that require installation, our testers run directly in your browser.
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-foreground mt-6">Benefits include</h3>
              <ul className="mt-4 list-disc pl-6 space-y-2">
                <li>No downloads or installations</li>
                <li>Instant test results</li>
                <li>Works on Windows, macOS, and Linux</li>
                <li>Secure browser-based testing environment</li>
              </ul>
              <p className="mt-4">
                We are constantly improving our tools and adding new features so you always have reliable testing options.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">About Us</h2>
              <p className="mt-4">
                Want to learn more about our mission and vision? Visit our <Link to="/about" className="text-primary hover:underline font-semibold">About</Link> page where we explain why we built GamepadChecker and how we aim to make device testing easier for everyone.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Contact Us</h2>
              <p className="mt-4">
                If you have questions or feedback, visit our <Link to="/contact" className="text-primary hover:underline font-semibold">Contact</Link> page. We welcome suggestions and ideas for new features.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Blog and Resources</h2>
              <p className="mt-4">
                Our <Link to="/blog" className="text-primary hover:underline font-semibold">Blog</Link> section shares guides and tips to help you make the most of your devices. Topics include:
              </p>
              <ul className="mt-4 list-disc pl-6 space-y-2">
                <li>How to fix stick drift in controllers</li>
                <li>The best way to test GPU online free</li>
                <li>How to set up your microphone correctly</li>
                <li>Simple steps for using a MIDI monitor online</li>
              </ul>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Final Words</h2>
              <p className="mt-4">
                At GamepadChecker our goal is to provide reliable tools for everyone. Whether you need a PS5 controller tester PC a GPU checker online or a MIDI monitor, our website brings everything together in one place.
              </p>
              <p className="mt-4">
                Save time, avoid frustration, and test your devices with GamepadChecker today.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- The rest of the file is unchanged --- */}
      <section className="py-20 sm:py-32" ref={faqAnimation.ref}><div className="mx-auto max-w-7xl px-6 lg:px-8"><div className={`mx-auto max-w-2xl text-center transition-all duration-700 ${ faqAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8' }`}><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2><p className="mt-6 text-lg leading-8 text-muted-foreground">Everything you need to know about our hardware testing tools.</p></div><div className={`mx-auto mt-16 max-w-2xl transition-all duration-700 ${ faqAnimation.isVisible ? 'animate-fade-in-up animate-stagger-1' : 'opacity-0 translate-y-8' }`}><dl className="space-y-8">{faqs.map((faq, index) => (<div key={faq.question} className={`transition-all duration-500 hover-scale hover:bg-muted/30 rounded-lg p-4 -m-4 ${ faqAnimation.isVisible ? 'animate-fade-in-left' : 'opacity-0 translate-x-8' }`} style={{ animationDelay: `${(index + 2) * 200}ms` }}><dt className="text-base font-semibold leading-7 flex items-start gap-2"><CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 transition-transform duration-300 hover:scale-125" />{faq.question}</dt><dd className="mt-2 ml-7 text-base leading-7 text-muted-foreground">{faq.answer}</dd></div>))}</dl></div></div></section>
      <section className="py-16 bg-gray-50/50"><div className="mx-auto max-w-7xl px-6 lg:px-8"><div className="mx-auto max-w-2xl text-center"><h2 className="text-2xl font-bold tracking-tight">Learn More</h2><p className="mt-4 text-lg text-muted-foreground">Discover guides and detailed information about our testing tools.</p></div><div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"><Link to="/blog/gamepad-tester-guide" className="group block rounded-lg border p-6 hover:bg-white hover:shadow-sm transition-all duration-300"><Gamepad2 className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" /><h3 className="font-semibold group-hover:text-primary transition-colors">Gamepad Guide</h3><p className="mt-2 text-sm text-muted-foreground">Complete guide to testing controllers</p></Link><Link to="/blog/gpu-tester-guide" className="group block rounded-lg border p-6 hover:bg-white hover:shadow-sm transition-all duration-300"><Monitor className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" /><h3 className="font-semibold group-hover:text-primary transition-colors">GPU Guide</h3><p className="mt-2 text-sm text-muted-foreground">Graphics performance testing guide</p></Link><Link to="/blog/mic-tester-guide" className="group block rounded-lg border p-6 hover:bg-white hover:shadow-sm transition-all duration-300"><Mic className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" /><h3 className="font-semibold group-hover:text-primary transition-colors">Mic Guide</h3><p className="mt-2 text-sm text-muted-foreground">Microphone testing tutorial</p></Link><Link to="/about" className="group block rounded-lg border p-6 hover:bg-white hover:shadow-sm transition-all duration-300"><Globe className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" /><h3 className="font-semibold group-hover:text-primary transition-colors">About Us</h3><p className="mt-2 text-sm text-muted-foreground">Learn about GamepadChecker</p></Link></div></div></section>
    </div>
  );
}