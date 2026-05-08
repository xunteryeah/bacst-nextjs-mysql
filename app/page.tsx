
"use client";

import Image from "next/image";
import React, { useState, useEffect } from 'react'


// 模拟后台数据（未来你可以用 props 或 API 获取）
const homeData = {
  bannerImage: "/home.jpg", // 你图片的路径
  mainSlogan: "专业制造微型充气泵",
  subSlogan:
      "公司优势：资深的研发团队、年产能1500万台、86,666平方米制造基地、行业标准主要起草单位、国内外车厂主要战略合作伙伴",
};
const homeprofileData = {
    ProfileText: "我们是一家专注于微型充气泵研发与制造的高新技术企业，拥有资深的研发团队和86,666平方米现代化制造基地。年产能达1500万台，是行业标准主要起草单位，长期与国内外知名车厂合作，致力于为客户提供高品质的产品与解决方案。",
    CompanyImage: "/company.jpg"
}

const partnerLogos = [
    { src: "/partners/lix.jpg", alt: "理想" },
    { src: "/partners/nio.png", alt: "蔚来" },
    { src: "/partners/honda.jpg", alt: "本田"},
    { src: "/partners/toyota.png", alt: "丰田" },
    { src: "/partners/vw.png", alt: "大众" },
    { src: "/partners/bmw.jpg", alt: "宝马" }
];

interface PartnerLogo {
    id: number; // 假设 id 是数字类型
    src: string;
    alt: string;
    // 如果您的 API 返回了 created_at 和 updated_at 并且您可能在组件中使用它们，也可以添加
    created_at?: string;
    updated_at?: string;
}

export default function Home() {
    //const { bannerImage, mainSlogan, subSlogan } =
    //const {ProfileText, CompanyImage} = homeprofileData

    const [bannerImage, setBannerImage] = useState("/home.jpg");
    const [mainSlogan, setMainSlogan] = useState("专业制造微型充气泵");
    const [subSlogan, setSubSlogan] = useState("公司优势：资深的研发团队、年产能1500万台、86,666平方米制造基地、行业标准主要起草单位、国内外车厂主要战略合作伙伴");

    const [ProfileText, setProfileText] = useState("是一家专注于微型充气泵研发与制造的高新技术企业，拥有资深的研发团队和86,666平方米现代化制造基地。年产能达1500万台，是行业标准主要起草单位，长期与国内外知名车厂合作，致力于为客户提供高品质的产品与解决方案。");
    const [CompanyImage, setCompanyImage] = useState("/company.jpg");

    //const [src, setSrc] = useState("/partners/lix.jpg");
    //const [alt, setAlt] = useState("理想");
    const [partnerLogos, setPartnerLogos] = useState<PartnerLogo[]>([]);
    //const [posthomedataloading, setposthomedataloading] = useState(false);


    useEffect(() => {
        fetchhomeData()
        fetchhomeprofileData()
        fetchPartnerLogos()
        ;
    }, [])
    const fetchhomeData = async () => {
        try {
            // 发起API请求获取首页数据
            const res = await fetch('/api/gethomedata')
            const json = await res.json()
            const data = json.data[0]
            // 更新页面状态
            // 需要使用 useState 来定义状态和对应的 setter
            setBannerImage(data.bannerImage)
            setMainSlogan(data.mainSlogan)
            setSubSlogan(data.subSlogan)
        } catch (error) {
            // 错误处理
            console.error('获取首页数据失败:', error)
        }
    }

    const fetchhomeprofileData = async () => {
        try {
            const res = await fetch('/api/gethomeprofileData')
            const json = await res.json()
            const data = json.data[0]
            // 新增公司简介相关状态更新
            setProfileText(data.ProfileText)
            setCompanyImage(data.CompanyImage)
        } catch (error) {
            console.error('获取数据失败:', error)
        }
    }

    const fetchPartnerLogos = async () => {
        try {
            const res = await fetch('/api/getpartnerLogos');
            const json = await res.json();
            if (json.data) {
                setPartnerLogos(json.data);
            } else {
                console.error('获取合作伙伴 logos 失败: 数据格式不正确', json);
                setPartnerLogos([]); // 设置为空数组以避免渲染错误
            }
        } catch (error) {
            console.error('获取合作伙伴 logos 失败:', error);
            setPartnerLogos([]); // 发生错误时也设置为空数组
        }
    };

    return (
      <main>
          <div className="relative w-full">
              {/* 背景图容器，自动按比例撑高 */}
              <div className="relative w-full aspect-[16/7]">
                  <Image
                      src={bannerImage}
                      alt="首页背景图"
                      fill
                      style={{objectFit: "cover"}}
                      priority
                  />
              </div>
              {/* 内容部分 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-white text-center">
                  <h1 className="text-3xl md:text-5xl font-bold mb-6 text-[#DD773F] -translate-y-28">
                      {mainSlogan}
                  </h1>
                  <p className="text-xl md:text-2xl max-w-5xl">
                      {subSlogan}
                  </p>
              </div>
          </div>


          <section className="w-full px-6 py-16 bg-white">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
                  {/* 左侧：公司简介 */}
                  <div className="flex-1 text-center md:text-left">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#DD773F] font-serif">
                          ABOUT COMPANY
                      </h2>
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#DD773F]">
                          公司简介
                      </h2>
                      <p className="text-lg leading-relaxed text-gray-700">
                          {ProfileText}
                      </p>
                  </div>

                  {/* 右侧：公司图片 */}
                  <div className="flex-1 w-full">
                      <img
                          src={CompanyImage}
                          alt="公司图片"
                          className="w-full h-auto rounded-lg shadow-lg object-cover"
                      />
                  </div>
              </div>
          </section>

          <section className="w-full px-6 py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#DD773F] font-serif">
                      COOPERATIVE PARTNER
                  </h2>
                  <h2 className="text-3xl md:text-4xl font-bold mb-10 text-[#DD773F]">合作伙伴</h2>

                  {/* 外层flex用于居中网格 */}
                  <div className="flex justify-center">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                          {partnerLogos.map((logo) => (
                              <div
                                  key={logo.id} // 修改这里，使用 logo.id 作为 key
                                  className="bg-white p-4 rounded shadow hover:shadow-md transition flex flex-col items-center text-center"
                              >
                                  <img
                                      src={logo.src}
                                      alt={logo.alt}
                                      className="w-full h-auto object-contain"
                                  />
                                  <p className="text-lg leading-relaxed text-gray-700 mt-2">
                                      {logo.alt}
                                  </p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </section>

      </main>
  );
}
