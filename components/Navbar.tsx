// components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react"; // 图标（你需要安装 lucide-react）


const navItems = [
    { name: "首页", href: "/" },
    { name: "关于我们", href: "/about" },
    { name: "产品中心", href: "/products" },
    { name: "资讯中心", href: "/news" },
    { name: "投资与合作", href: "/investment" },
    { name: "联系我们", href: "/contact" },
];

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <nav className="w-full bg-white shadow-md p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2">
                    <Image
                        src="/bakesit_logo_o.svg"
                        alt="Bakesit 图标"
                        width={40}
                        height={40}
                        priority
                    />
                    <Image
                        src="/bakesit_CNlogo_o.svg"
                        alt="Bakesit 图标"
                        width={100}
                        height={40}
                        priority
                    />
                    <Image
                        src="/bakesit_ENlogo_o.svg"
                        alt="Bakesit 字标"
                        width={100}
                        height={40}
                        priority
                    />
                </Link>
                {/* 汉堡按钮 (小屏显示) */}
                <button
                    className="md:hidden"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle Menu"
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                {/* 菜单项：大屏显示 */}
                <ul className="hidden md:flex space-x-6 text-gray-700">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href} className="hover:text-blue-600">
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            {/* 移动端菜单项 */}
            {menuOpen && (
                <ul className="md:hidden px-4 pb-4 space-y-2 text-gray-700">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className="block py-2 hover:text-blue-600"
                                onClick={() => setMenuOpen(false)} // 点击后自动关闭菜单
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </nav>
    );
}
