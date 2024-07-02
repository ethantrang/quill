import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { LoginLink, RegisterLink, getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react"

export default function NavBar() {

    const { getUser } = getKindeServerSession()
    const user = getUser()

    return (
        <>
            <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
                <MaxWidthWrapper className="flex justify-between items-center h-14">
                    <Link href="/" className="flex z-40 font-semibold items-center h-full">
                        <span>quill.</span>
                    </Link>

                    <div className="hidden sm:flex items-center space-x-4">
                        <Link href="/pricing" className={buttonVariants({
                            variant: "ghost",
                            size: "sm"
                        })}>Pricing</Link>

                        <LoginLink className={buttonVariants({
                            variant: "ghost",
                            size: "sm"
                        })}>Sign in</LoginLink>

                        <RegisterLink className={buttonVariants({
                            size: "sm"
                        })}>Get started <ArrowRight className="ml-1.5 h-5 w-5" /></RegisterLink>
                    </div>
                </MaxWidthWrapper>
            </nav>
        </>
    );
}
