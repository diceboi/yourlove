export default function AccountPageSkeleton() {
    return (
        <div className="w-full xl:pt-18 pt-10 xl:pb-8 pb-4 px-4 xl:px-12">
            <div className="flex md:flex-row flex-col gap-8 animate-pulse">
                {/* Left Menu Skeleton */}
                <div className="md:w-1/4 w-full space-y-2">
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>

                {/* Right Content Skeleton */}
                <div className="md:w-3/4 w-full space-y-6">
                    {/* Title */}
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>

                    {/* Form fields */}
                    <div className="space-y-4">
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                    </div>

                    {/* Button */}
                    <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
                </div>
            </div>
        </div>
    )
}
