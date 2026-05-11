"use client";

import Image from "next/image";
import React, { useState, useEffect } from 'react'

export default function ContactPage() {

  const [contactBg, setContactBg] = useState("/contact-bg.jpg");
  const [addresses, setAddresses] = useState<string[]>(["上海市奉贤区海湾旅游区奉炮公路1368号阿莱德科技园5号楼2楼"]);
  const [phone, setphone] = useState("15000256347");
  const [factoryAddress, setFactoryAddress] = useState("浙江省宁波市慈溪市周巷镇开发东路488号3楼");
  const [email, setEmail] = useState("Daniel.sun815@outlook.com");

  useEffect(() => {
    fetchgetaddress()
    fetchgetshopURLData()
  }, [])

  const [name, setName] = useState("");
  const [tophone, setTophone] = useState("");
  const [message, setMessage] = useState("");
  const [purpose, setPurpose] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  const [jd, setJd] = useState("/jd.png");
  const [dy, setDy] = useState("/dy.png");
  const [wx, setWx] = useState("/wx.png");
  const [wxgzh, setWxgzh] = useState("/wxgzh.png");


  const postToemail = async () => {
    setContactLoading(true);
    try {
      const res = await fetch('/api/postToemail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, tophone, message, purpose }),
      });
      const json = await res.json();
      setContactMessage(json.message);
      setContactLoading(false);
    } catch (error) {
      setContactMessage('发送失败');
      setContactLoading(false);
    }
  };


  const fetchgetshopURLData = async () => {
    try {
      // 发起API请求获取首页数据
      const res = await fetch('/api/getshopURLData')
      const json = await res.json()
      const data = json.data[0]
      // 更新页面状态
      // 需要使用 useState 来定义状态和对应的 setter
      setJd(data.jd)
      setDy(data.dy)
      setWx(data.wx)
      setWxgzh(data.wxgzh)
    } catch (error) {
      // 错误处理
      console.error('获取首页数据失败:', error)
    }
  }

  const fetchgetaddress = async () => {
    try {
      // 发起API请求获取首页数据
      const res = await fetch('/api/getaddress')
      const json = await res.json()
      const data = json.data[0]
      // 更新页面状态
      // 需要使用 useState 来定义状态和对应的 setter
      setContactBg(data.contactBg)
      const list = Array.isArray(data.address)
        ? data.address.filter((a: unknown): a is string => typeof a === 'string' && a.trim() !== '')
        : (data.address ? [data.address] : [])
      if (list.length > 0) setAddresses(list)
      setphone(data.phone)
      setFactoryAddress(data.factoryAddress ?? "")
      setEmail(data.email)
    } catch (error) {
      // 错误处理
      console.error('获取首页数据失败:', error)
    }
  }

  return (
    <div className="relative w-full min-h-screen">
      {/* 背景图容器 */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={contactBg}
          alt="Contact Background"
          fill
          style={{ objectFit: "cover" }}
          className="brightness-90"
          priority
        />
      </div>

      {/* 内容容器 */}
      <div className="flex flex-col md:flex-row items-start justify-center px-6 md:px-16 py-16 bg-white/80 backdrop-blur-sm rounded-lg m-6 md:mx-24 shadow-lg">
        {/* 左侧联系信息 */}
        <div className="md:w-1/2 w-full mb-10 md:mb-0 pr-0 md:pr-12">
          <h2 className="text-3xl font-bold text-gray-700 mb-6">联系我们</h2>
          <div className="text-sm space-y-4 text-gray-600">
            {addresses.map((addr, i) => (
              <p key={i}>
                <span className="font-semibold">公司地址{addresses.length > 1 ? i + 1 : ''}：</span>{addr}
              </p>
            ))}
            {factoryAddress && (
              <p><span className="font-semibold">工厂地址：</span>{factoryAddress}</p>
            )}
            <p><span className="font-semibold">联系电话：</span>{phone}</p>
            <p><span className="font-semibold">邮箱：</span>{email}</p>
          </div>
          {/* 二维码区域 */}
          <div className="mt-8">
            <div className="grid grid-cols-2 gap-6">
              {/* 微信二维码 */}
              <div className="flex flex-col items-center">
                <Image
                  src={wx}
                  alt="微信二维码"
                  width={100}
                  height={100}
                  className="border border-gray-200 rounded-md"
                />
                <p className="text-xs mt-2 text-gray-600">微信</p>
              </div>

              {/* 抖音小店二维码 */}
              <div className="flex flex-col items-center">
                <Image
                  src={dy}
                  alt="抖音小店二维码"
                  width={100}
                  height={100}
                  className="border border-gray-200 rounded-md"
                />
                <p className="text-xs mt-2 text-gray-600">抖音小店</p>
              </div>

              {/* 微信公众号二维码 */}
              <div className="flex flex-col items-center">
                <Image
                  src={wxgzh}
                  alt="微信公众号二维码"
                  width={100}
                  height={100}
                  className="border border-gray-200 rounded-md"
                />
                <p className="text-xs mt-2 text-gray-600">微信公众号</p>
              </div>

              {/* 京东二维码 */}
              <div className="flex flex-col items-center">
                <Image
                  src={jd}
                  alt="京东二维码"
                  width={100}
                  height={100}
                  className="border border-gray-200 rounded-md"
                />
                <p className="text-xs mt-2 text-gray-600">京东</p>
              </div>

            </div>
          </div>
        </div>

        {/* 右侧表单 */}
        <div className="md:w-1/2 w-full bg-white p-10 shadow-md border rounded-lg">
          <h3 className="text-2xl font-semibold mb-6 text-gray-700">在线留言</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">称呼</label>
              <input
                type="text"
                placeholder="请输入您的称呼"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-500 rounded px-4 py-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DD773F] text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">联系方式</label>
              <input
                type="text"
                placeholder="手机号或邮箱"
                value={tophone}
                onChange={(e) => setTophone(e.target.value)}
                className="w-full border border-gray-500 rounded px-4 py-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DD773F] text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">联系目的</label>
              <select
                className="w-full border border-gray-500 rounded px-4 py-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DD773F] text-gray-900"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              >
                <option>加入我们</option>
                <option>合作资讯</option>
                <option>咨询购买</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">留言内容</label>
              <textarea
                rows={4}
                placeholder="请输入您的留言内容"
                className="w-full border border-gray-500 rounded px-4 py-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DD773F] text-gray-900"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <button
              onClick={postToemail}
              disabled={contactLoading}
              type="submit"
              className="w-full bg-[#DD773F] text-white py-2 px-4 rounded hover:bg-[#c26835] transition-colors"
            >
              {contactLoading ? '提交中...' : '提交信息'}
            </button>
            <p className="text-red-500 mt-2">{contactMessage}</p>
          </form>
        </div>
      </div>
    </div>
  );
}
