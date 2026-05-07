const InfoPageLayout = ({ title, children }) => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
    <div className="text-gray-700 space-y-4 leading-relaxed">{children}</div>
  </div>
)

export default InfoPageLayout
