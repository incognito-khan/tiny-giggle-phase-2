import { SmallCardsData } from "@/components/data/about/smallcardsdata"

export default function SmallCards() {
    return (
        <div className="pt-7 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* SmallCardsData Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                    {SmallCardsData.map((facility) => (
                        <div key={facility.id}>
                            {/* Antenna SVG */}
                            <svg
                                className="absolute top-[16%] z-10"
                                width="51"
                                height="25"
                                viewBox="0 0 51 25"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M1.22334 5.96216C-2.80791 4.16304 4.56635 -0.155225 6.66735 0.0125662C9.56929 0.24275 11.4149 2.05692 10.614 6.14164C10.1961 8.27957 12.3436 11.0964 13.9067 13.1524C16.2476 16.2384 19.165 18.8641 21.6955 21.8096C23.4947 23.9047 27.5419 23.8813 29.465 21.7121C32.5719 18.2125 35.8918 14.8964 38.8788 11.2991L38.8865 11.303C39.6488 10.2066 39.8693 8.81775 39.4902 7.53425C38.4145 5.09589 39.3044 3.93324 41.4905 2.96964C45.53 1.19454 48.7956 1.59245 49.7436 4.22198C50.7263 6.94908 49.1322 8.40037 46.7024 9.2665C40.0821 11.623 33.5052 22.32 34.6341 23.2657C35.464 23.9609 38.0209 24.2114 38.1012 24.2513C29.5541 24.2114 19.5821 24.2253 13.9857 24.2513C13.9145 24.2516 17.1281 23.5893 18.265 23.4549C21.4636 23.0766 8.86433 9.37229 1.22334 5.96216Z"
                                    fill={
                                        facility.id === 1
                                            ? "#4F830E"
                                            : facility.id === 2
                                                ? "#5C198E"
                                                : "#CE7A02"
                                    }
                                />
                            </svg>
                            <div
                                key={facility.id}
                                className={`relative rounded-3xl p-8 text-white overflow-hidden cursor-pointer transition-all z-[1] duration-500 hover:shadow-2xl my-20 bg-gradient-to-br ${facility.bgGradient}`}
                            >
                                {/* Decorative Dotted Border at Top */}
                                <div className="absolute top-0 left-0 right-0 h-6">
                                    <svg
                                        className="w-full h-full"
                                        viewBox="0 0 400 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        preserveAspectRatio="none"
                                    >
                                        <path
                                            d="M0 12C11 6 22 6 33 12C44 18 55 18 66 12C77 6 88 6 99 12C110 18 121 18 132 12C143 6 154 6 165 12C176 18 187 18 198 12C209 6 220 6 231 12C242 18 253 18 264 12C275 6 286 6 297 12C308 18 319 18 330 12C341 6 352 6 363 12C374 18 385 18 396 12"
                                            stroke="rgba(255,255,255,0.3)"
                                            strokeWidth="2"
                                            strokeDasharray="4,4"
                                        />
                                    </svg>
                                </div>

                                {/* Decorative Elements at Top Corners */}
                                <div className="absolute top-4 left-4">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-6 bg-white/30 rounded-full"></div>
                                        <div className="w-2 h-6 bg-white/30 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-6 bg-white/30 rounded-full"></div>
                                        <div className="w-2 h-6 bg-white/30 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Content Container */}
                                <div className="flex items-center gap-6 mt-8">
                                    {/* Icon Circle */}
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <facility.icon className="w-10 h-10 text-gray-700" />
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white mb-3 leading-tight">{facility.title}</h3>
                                        <p className="text-white/90 text-base leading-relaxed">{facility.description}</p>
                                    </div>
                                </div>

                                {/* Subtle Pattern Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
