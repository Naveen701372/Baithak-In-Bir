export default function MenuPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-5xl font-light text-black mb-8 tracking-tight">
            Our Menu
          </h1>
          <div className="w-24 h-px bg-black mx-auto mb-12"></div>
          <p className="text-lg text-gray-600 mb-16 font-light leading-relaxed">
            Our carefully curated menu will be available here soon.
          </p>
          
          <div className="border border-gray-200 p-12 bg-gray-50">
            <div className="w-12 h-12 border border-black mx-auto mb-6 flex items-center justify-center">
              <span className="text-black font-light">⚡</span>
            </div>
            <p className="text-gray-700 font-light leading-relaxed">
              This page will showcase our beautiful, mobile-responsive menu interface 
              with elegant food presentation and seamless ordering experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}