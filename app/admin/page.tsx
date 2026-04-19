"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Home,
  Package,
  Info,
  Newspaper,
  Phone,
  QrCode,
  Award,
  Briefcase,
  Menu,
  X,
  ChevronRight,
  Upload,
  Trash2,
  Plus,
  Check,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";

// ==================== Types ====================

interface PartnerLogo {
  id: number;
  src: string;
  alt: string;
  created_at?: string;
  updated_at?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  mainimage: string;
  category?: string;
  images: string[];
  specs: [string, string][];
  createdAt?: string;
  updatedAt?: string;
}

interface Certification {
  id: number;
  src: string;
  title: string;
  subtitle?: string;
  created_at?: string;
}

interface Job {
  id: number;
  title: string;
  category: string;
  location: string;
  description?: string;
  created_at?: string;
}

// ==================== Toast Component ====================

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm animate-[slideIn_0.3s_ease] ${
            t.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {t.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ==================== Reusable Components ====================

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function SubmitButton({
  loading,
  label = "保存",
  loadingLabel = "保存中...",
}: {
  loading: boolean;
  label?: string;
  loadingLabel?: string;
}) {
  return (
    <button
      type="submit"
      className="w-full bg-[#DD773F] text-white py-2.5 rounded-lg text-base font-semibold hover:bg-[#c05e2d] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <Upload size={16} />
          {label}
        </>
      )}
    </button>
  );
}

function ImageUploader({
  label,
  hint,
  value,
  onUploaded,
  required = true,
}: {
  label: string;
  hint?: string;
  value: string;
  onUploaded: (path: string) => void;
  required?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      <input
        type="file"
        accept="image/*"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-[#DD773F]/10 file:text-[#DD773F] hover:file:bg-[#DD773F]/20"
        required={required && !value}
        disabled={uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          const formData = new FormData();
          formData.append("file", file);
          try {
            const response = await fetch("/api/upload", { method: "POST", body: formData } as RequestInit);
            if (response.ok) {
              const data = await response.json();
              onUploaded(data.filePath);
            } else {
              throw new Error("上传失败");
            }
          } catch {
            alert("文件上传失败，请重试");
          } finally {
            setUploading(false);
          }
        }}
      />
      {uploading && <p className="text-xs text-[#DD773F] mt-1">上传中...</p>}
      {value && (
        <div className="mt-2 flex items-center gap-2">
          <img src={value} alt="preview" className="w-16 h-16 object-cover rounded border" />
          <span className="text-xs text-green-600">已上传</span>
        </div>
      )}
    </div>
  );
}

// ==================== TSV Parser (handles quoted multi-line cells from Excel) ====================

function parseTSV(text: string): [string, string][] {
  const results: [string, string][] = [];
  let i = 0;
  const len = text.length;

  // Parse one field: either quoted or unquoted
  function parseField(): string {
    if (i >= len) return "";
    if (text[i] === '"') {
      // Quoted field — may contain newlines and escaped quotes ("")
      i++; // skip opening quote
      let value = "";
      while (i < len) {
        if (text[i] === '"') {
          if (i + 1 < len && text[i + 1] === '"') {
            // Escaped quote
            value += '"';
            i += 2;
          } else {
            // Closing quote
            i++; // skip closing quote
            break;
          }
        } else {
          value += text[i];
          i++;
        }
      }
      return value.trim();
    } else {
      // Unquoted field — read until tab or newline
      let value = "";
      while (i < len && text[i] !== "\t" && text[i] !== "\n" && text[i] !== "\r") {
        value += text[i];
        i++;
      }
      return value.trim();
    }
  }

  while (i < len) {
    // Skip leading \r or \n between rows (blank lines)
    if (text[i] === "\r" || text[i] === "\n") { i++; continue; }

    const col1 = parseField();
    let col2 = "";
    if (i < len && text[i] === "\t") {
      i++; // skip tab
      col2 = parseField();
    }
    // Skip any remaining columns on this row
    while (i < len && text[i] === "\t") {
      i++;
      parseField();
    }
    // Skip row-ending \r\n or \n
    if (i < len && text[i] === "\r") i++;
    if (i < len && text[i] === "\n") i++;

    if (col1 || col2) {
      // If cell contains newlines, replace with spaces for display
      results.push([col1.replace(/\n/g, " "), col2.replace(/\n/g, " ")]);
    }
  }
  return results;
}

// ==================== Tab definitions ====================

const TABS = [
  { key: "home", label: "首页管理", icon: Home },
  { key: "products", label: "产品管理", icon: Package },
  { key: "about", label: "关于我们", icon: Info },
  { key: "news", label: "新闻管理", icon: Newspaper },
  { key: "contact", label: "联系方式", icon: Phone },
  { key: "shop", label: "店铺二维码", icon: QrCode },
  { key: "certs", label: "资质证书", icon: Award },
  { key: "recruit", label: "招聘管理", icon: Briefcase },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ==================== Main Page ====================

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ---- Toast helper ----
  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---- Auth header helper ----
  const authHeaders = (extra?: Record<string, string>) => ({
    "x-api-key": apiKey,
    ...extra,
  });
  const jsonAuthHeaders = () => authHeaders({ "Content-Type": "application/json" });

  // ==================== Home states ====================
  const [bannerImage, setBannerImage] = useState("");
  const [mainSlogan, setMainSlogan] = useState("");
  const [subSlogan, setSubSlogan] = useState("");
  const [posthomedataloading, setposthomedataloading] = useState(false);

  const [ProfileText, setProfileText] = useState("");
  const [CompanyImage, setCompanyImage] = useState("");
  const [posthomeprofileloading, setposthomeprofileloading] = useState(false);

  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [postpartnerLogosloading, setpostpartnerLogosloading] = useState(false);
  const [partnerLogos, setPartnerLogos] = useState<PartnerLogo[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ==================== Product states ====================
  const [category, setCategory] = useState("");
  const [postproduct_categoriesloading, setpostproduct_categoriesloading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [deleteproduct_categoriesLoading, setDeleteproduct_categoriesLoading] = useState(false);

  const [product, setProducts] = useState<Product[]>([]);
  const [deleteproductsLoading, setDeleteproductsLoading] = useState(false);

  const [name, setName] = useState("");
  const [productcategory, setProductCategory] = useState("");
  const [description, setDescription] = useState("");
  const [mainimage, setMainimage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<[string, string][]>([]);
  const [postproductsloading, setpostproductsloading] = useState(false);

  // ==================== Contact states ====================
  const [contactBg, setContactBg] = useState("");
  const [email, setEmail] = useState("");
  const [adddress, setAdddress] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [postaddressloading, setpostaddressloading] = useState(false);

  // ==================== About states ====================
  const [aboutBanner, setAboutBanner] = useState("");
  const [mainTitle, setMainTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [postaboutDataloading, setpostaboutDataloading] = useState(false);

  const [AboutText, setAboutText] = useState("");
  const [AboutImage, setAboutImage] = useState("");
  const [postaboutdetailDataloading, setpostaboutdetailDataloading] = useState(false);

  const [brandIntroduction, setBrandIntroduction] = useState("");
  const [operationImage, setOperationImage] = useState("");
  const [managementIdea, setManagementIdea] = useState("");
  const [declaration, setDeclaration] = useState<string[]>([]);
  const [postcompanyCultureloading, setpostcompanyCultureloading] = useState(false);

  // ==================== News states ====================
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [postnewDataLoading, setPostnewDataLoading] = useState(false);

  const [deletetotitle, setDeletetotitle] = useState("");
  const [deletenewsLoading, setDeletenewsLoading] = useState(false);

  // ==================== Shop URL states ====================
  const [jd, setJd] = useState("");
  const [dy, setDy] = useState("");
  const [wx, setWx] = useState("");
  const [wxgzh, setWxgzh] = useState("");
  const [postshopURLDataloading, setPostshopURLDataloading] = useState(false);

  // ==================== Certification states ====================
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certSrc, setCertSrc] = useState("");
  const [certTitle, setCertTitle] = useState("");
  const [certSubtitle, setCertSubtitle] = useState("");
  const [postCertLoading, setPostCertLoading] = useState(false);
  const [deleteCertLoading, setDeleteCertLoading] = useState(false);

  // ==================== Recruitment states ====================
  const [recBannerImage, setRecBannerImage] = useState("");
  const [recBannerTitle, setRecBannerTitle] = useState("");
  const [postRecruitmentSettingsLoading, setPostRecruitmentSettingsLoading] = useState(false);
  const [jobCategories, setJobCategories] = useState<string[]>([]);
  const [newJobCategoryName, setNewJobCategoryName] = useState("");
  const [postJobCategoryLoading, setPostJobCategoryLoading] = useState(false);
  const [deleteJobCategoryLoading, setDeleteJobCategoryLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [postJobLoading, setPostJobLoading] = useState(false);
  const [deleteJobLoading, setDeleteJobLoading] = useState(false);

  // ==================== Data Fetching ====================

  const fetchPartnerLogos = useCallback(async () => {
    try {
      const res = await fetch("/api/getpartnerLogos");
      const json = await res.json();
      setPartnerLogos(json.data || []);
    } catch {
      setPartnerLogos([]);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/getproductcategory");
      const json = await res.json();
      const list = Array.isArray(json?.data) ? json.data.map((row: any) => row.category).filter(Boolean) : [];
      setCategories(list);
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/getproductsimpledata");
      const json = await res.json();
      setProducts(Array.isArray(json?.data) ? json.data : []);
    } catch {
      setProducts([]);
    }
  }, []);

  const fetchCertifications = useCallback(async () => {
    try {
      const res = await fetch("/api/getcertifications");
      const json = await res.json();
      setCertifications(Array.isArray(json?.data) ? json.data : []);
    } catch {
      setCertifications([]);
    }
  }, []);

  const fetchJobCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/getjobcategories");
      const json = await res.json();
      const list = Array.isArray(json?.data) ? json.data.map((row: any) => row.category).filter(Boolean) : [];
      setJobCategories(list);
    } catch {
      setJobCategories([]);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/getjobs");
      const json = await res.json();
      setJobs(Array.isArray(json?.data) ? json.data : []);
    } catch {
      setJobs([]);
    }
  }, []);

  const fetchRecruitmentSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/getrecruitmentsettings");
      const json = await res.json();
      const data = json?.data;
      if (data) {
        setRecBannerImage(data.bannerImage || "");
        setRecBannerTitle(data.bannerTitle || "");
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchPartnerLogos();
    fetchCategories();
    fetchProducts();
    fetchCertifications();
    fetchJobCategories();
    fetchJobs();
    fetchRecruitmentSettings();
  }, [fetchPartnerLogos, fetchCategories, fetchProducts, fetchCertifications, fetchJobCategories, fetchJobs, fetchRecruitmentSettings]);

  // ==================== API Handlers ====================

  const handleSubmitHomeData = async (e: React.FormEvent) => {
    e.preventDefault();
    setposthomedataloading(true);
    try {
      const res = await fetch("/api/posthomedata", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ bannerImage, mainSlogan, subSlogan }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("首页大图内容上传成功！", "success");
        setBannerImage("");
        setMainSlogan("");
        setSubSlogan("");
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + error, "error");
    }
    setposthomedataloading(false);
  };

  const handleSubmitHomeProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setposthomeprofileloading(true);
    try {
      const res = await fetch("/api/posthomeprofiledata", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ ProfileText, CompanyImage }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("公司简介上传成功！", "success");
        setProfileText("");
        setCompanyImage("");
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + error, "error");
    }
    setposthomeprofileloading(false);
  };

  const handleSubmitPartnerLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    setpostpartnerLogosloading(true);
    try {
      const res = await fetch("/api/postpartnerLogos", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ src, alt }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("合作伙伴添加成功！", "success");
        setSrc("");
        setAlt("");
        fetchPartnerLogos();
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + error, "error");
    }
    setpostpartnerLogosloading(false);
  };

  const deletePartnerLogo = async (alt: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/deletepartnerLogos?alt=${encodeURIComponent(alt)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`已删除: ${alt}`, "success");
        fetchPartnerLogos();
      } else {
        addToast(`删除失败: ${data.error || "未知错误"}`, "error");
      }
    } catch (error) {
      addToast(`请求出错: ${error}`, "error");
    }
    setDeleteLoading(false);
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setpostproduct_categoriesloading(true);
    try {
      const res = await fetch("/api/postproduct_categories", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("产品分类添加成功！", "success");
        setCategory("");
        fetchCategories();
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + error, "error");
    }
    setpostproduct_categoriesloading(false);
  };

  const deleteCategory = async (cat: string) => {
    setDeleteproduct_categoriesLoading(true);
    try {
      const res = await fetch(`/api/deletecategory?category=${encodeURIComponent(cat)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`分类已删除: ${cat}`, "success");
        fetchCategories();
      } else {
        addToast(`删除失败: ${data.error || "未知错误"}`, "error");
      }
    } catch (error) {
      addToast(`请求出错: ${error}`, "error");
    }
    setDeleteproduct_categoriesLoading(false);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setpostproductsloading(true);
    try {
      const res = await fetch("/api/postproductdata", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({
          name,
          description,
          mainimage,
          category: productcategory,
          images: JSON.stringify(images),
          specs: JSON.stringify(specs),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("产品添加成功！", "success");
        setName("");
        setDescription("");
        setMainimage("");
        setProductCategory("");
        setImages([]);
        setSpecs([]);
        fetchProducts();
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + error, "error");
    }
    setpostproductsloading(false);
  };

  const deleteProduct = async (productName: string) => {
    setDeleteproductsLoading(true);
    try {
      const res = await fetch(`/api/deleteproductdata?name=${encodeURIComponent(productName)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`产品已删除: ${productName}`, "success");
        fetchProducts();
      } else {
        addToast(`删除失败: ${data.error || "未知错误"}`, "error");
      }
    } catch (error) {
      addToast(`请求出错: ${error}`, "error");
    }
    setDeleteproductsLoading(false);
  };

  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setpostaddressloading(true);
    try {
      const res = await fetch("/api/postaddress", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ contactBg, email, address, phone, adddress }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("联系方式上传成功！", "success");
        setContactBg("");
        setEmail("");
        setAddress("");
        setPhone("");
        setAdddress("");
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + error, "error");
    }
    setpostaddressloading(false);
  };

  const handleSubmitAboutBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setpostaboutDataloading(true);
    try {
      const res = await fetch("/api/postaboutdata", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ aboutBanner, mainTitle, subTitle }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("关于公司大图上传成功！", "success");
        setAboutBanner("");
        setMainTitle("");
        setSubTitle("");
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + error, "error");
    }
    setpostaboutDataloading(false);
  };

  const handleSubmitAboutDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    setpostaboutdetailDataloading(true);
    try {
      const res = await fetch("/api/postaboutdetaildata", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ AboutText, AboutImage }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("关于公司详情上传成功！", "success");
        setAboutText("");
        setAboutImage("");
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + error, "error");
    }
    setpostaboutdetailDataloading(false);
  };

  const handleSubmitCompanyCulture = async (e: React.FormEvent) => {
    e.preventDefault();
    setpostcompanyCultureloading(true);
    try {
      const res = await fetch("/api/postcompanyCulture", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({
          brandIntroduction,
          operationImage,
          managementIdea,
          declaration: JSON.stringify(declaration),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("企业文化上传成功！", "success");
        setBrandIntroduction("");
        setOperationImage("");
        setManagementIdea("");
        setDeclaration([]);
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + error, "error");
    }
    setpostcompanyCultureloading(false);
  };

  const handleSubmitNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostnewDataLoading(true);
    try {
      const res = await fetch("/api/postnews", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ title, summary, pdfUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("新闻添加成功！", "success");
        setTitle("");
        setSummary("");
        setPdfUrl("");
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + error, "error");
    }
    setPostnewDataLoading(false);
  };

  const deleteNews = async (newsTitle: string) => {
    setDeletenewsLoading(true);
    try {
      const res = await fetch(`/api/deletenews?title=${encodeURIComponent(newsTitle)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`新闻已删除: ${newsTitle}`, "success");
        setDeletetotitle("");
      } else {
        addToast(`删除失败: ${data.error || "未知错误"}`, "error");
      }
    } catch (error) {
      addToast(`请求出错: ${error}`, "error");
    }
    setDeletenewsLoading(false);
  };

  const handleSubmitShopURL = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostshopURLDataloading(true);
    try {
      const res = await fetch("/api/postshopURLData", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ jd, dy, wx, wxgzh }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("店铺二维码更新成功！", "success");
        setJd("");
        setDy("");
        setWx("");
        setWxgzh("");
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + error, "error");
    }
    setPostshopURLDataloading(false);
  };

  const handleSubmitCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostCertLoading(true);
    try {
      const res = await fetch("/api/postcertifications", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ src: certSrc, title: certTitle, subtitle: certSubtitle }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("证书添加成功！", "success");
        setCertSrc("");
        setCertTitle("");
        setCertSubtitle("");
        fetchCertifications();
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + String(error), "error");
    }
    setPostCertLoading(false);
  };

  const deleteCertification = async (certTitleToDelete: string) => {
    if (!certTitleToDelete) return;
    setDeleteCertLoading(true);
    try {
      const res = await fetch(`/api/deletecertification?title=${encodeURIComponent(certTitleToDelete)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`证书已删除: ${certTitleToDelete}`, "success");
        fetchCertifications();
      } else {
        addToast("删除失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + String(error), "error");
    }
    setDeleteCertLoading(false);
  };

  const handleSubmitRecruitmentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostRecruitmentSettingsLoading(true);
    try {
      const res = await fetch("/api/postrecruitmentsettings", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ bannerImage: recBannerImage, bannerTitle: recBannerTitle }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("招聘设置更新成功！", "success");
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + String(error), "error");
    }
    setPostRecruitmentSettingsLoading(false);
  };

  const handleSubmitJobCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostJobCategoryLoading(true);
    try {
      const res = await fetch("/api/postjobcategory", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ category: newJobCategoryName }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("职位分类添加成功！", "success");
        setNewJobCategoryName("");
        fetchJobCategories();
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + String(error), "error");
    }
    setPostJobCategoryLoading(false);
  };

  const deleteJobCategory = async (cat: string) => {
    setDeleteJobCategoryLoading(true);
    try {
      const res = await fetch(`/api/deletejobcategory?category=${encodeURIComponent(cat)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`职位分类已删除: ${cat}`, "success");
        fetchJobCategories();
      } else {
        addToast("删除失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + String(error), "error");
    }
    setDeleteJobCategoryLoading(false);
  };

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostJobLoading(true);
    try {
      const res = await fetch("/api/postjob", {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({
          title: jobTitle,
          category: jobCategory,
          location: jobLocation,
          description: jobDescription,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("职位添加成功！", "success");
        setJobTitle("");
        setJobCategory("");
        setJobLocation("");
        setJobDescription("");
        fetchJobs();
      } else {
        addToast("上传失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + String(error), "error");
    }
    setPostJobLoading(false);
  };

  const deleteJob = async (jTitle: string) => {
    setDeleteJobLoading(true);
    try {
      const res = await fetch(`/api/deletejob?title=${encodeURIComponent(jTitle)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`职位已删除: ${jTitle}`, "success");
        fetchJobs();
      } else {
        addToast("删除失败: " + (data.error || "未知错误"), "error");
      }
    } catch (error) {
      addToast("请求出错: " + String(error), "error");
    }
    setDeleteJobLoading(false);
  };

  // ==================== Tab Content Renderers ====================

  const renderHome = () => (
    <div className="space-y-6">
      <SectionCard title="首页大图内容">
        <form onSubmit={handleSubmitHomeData} className="space-y-4">
          <ImageUploader label="大图图片" hint="建议比例 16:7" value={bannerImage} onUploaded={setBannerImage} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">大图标题</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              value={mainSlogan}
              onChange={(e) => setMainSlogan(e.target.value)}
              placeholder="例如：专业制造微型充气泵"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">大图标题内容</label>
            <textarea
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              value={subSlogan}
              onChange={(e) => setSubSlogan(e.target.value)}
              placeholder="例如：资深研发团队、1500万年产能..."
              rows={4}
              required
            />
          </div>
          <SubmitButton loading={posthomedataloading} />
        </form>
      </SectionCard>

      <SectionCard title="公司简介内容">
        <form onSubmit={handleSubmitHomeProfile} className="space-y-4">
          <ImageUploader label="公司简介图片" value={CompanyImage} onUploaded={setCompanyImage} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公司简介内容</label>
            <textarea
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              value={ProfileText}
              onChange={(e) => setProfileText(e.target.value)}
              placeholder="例如：我们是一家专注于微型充气泵研发与制造的高新技术企业..."
              rows={4}
              required
            />
          </div>
          <SubmitButton loading={posthomeprofileloading} />
        </form>
      </SectionCard>

      <SectionCard title="合作伙伴管理">
        <form onSubmit={handleSubmitPartnerLogo} className="space-y-4 mb-6">
          <ImageUploader label="合作伙伴 Logo" hint="建议比例 1:1" value={src} onUploaded={setSrc} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">合作伙伴名称</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="例如：奔驰，宝马"
              required
            />
          </div>
          <SubmitButton loading={postpartnerLogosloading} label="添加合作伙伴" loadingLabel="添加中..." />
        </form>

        {partnerLogos.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">现有合作伙伴 ({partnerLogos.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {partnerLogos.map((logo) => (
                <div key={logo.id} className="bg-gray-50 p-3 rounded-lg flex flex-col items-center text-center group">
                  <img src={logo.src} alt={logo.alt} className="w-16 h-16 object-contain mb-2" />
                  <p className="text-xs text-gray-700 mb-2">{logo.alt}</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`确定要删除「${logo.alt}」吗？`)) {
                        deletePartnerLogo(logo.alt);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition bg-red-100 text-red-700 hover:bg-red-200 text-xs px-2 py-1 rounded flex items-center gap-1"
                    disabled={deleteLoading}
                  >
                    <Trash2 size={12} /> 删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <SectionCard title="产品分类管理">
        <form onSubmit={handleSubmitCategory} className="space-y-4 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="新增分类名称，例如：微型发动机"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#DD773F] text-white rounded-lg text-sm font-medium hover:bg-[#c05e2d] transition flex items-center gap-1 whitespace-nowrap disabled:opacity-50"
              disabled={postproduct_categoriesloading}
            >
              <Plus size={14} /> 添加
            </button>
          </div>
        </form>

        {categories.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">现有分类 ({categories.length})</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <div key={c} className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-800">
                  {c}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`确定要删除分类「${c}」吗？`)) deleteCategory(c);
                    }}
                    className="ml-1 text-gray-400 hover:text-red-500 transition"
                    disabled={deleteproduct_categoriesLoading}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="添加产品">
        <form onSubmit={handleSubmitProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">产品名称</label>
              <input
                type="text"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：充气泵"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">产品分类</label>
              <select
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
                value={productcategory}
                onChange={(e) => setProductCategory(e.target.value)}
                required
              >
                <option value="">请选择分类</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">产品描述</label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例如：这款智能微型充气泵采用高精度集成芯片..."
              required
            />
          </div>

          <ImageUploader label="产品主图" value={mainimage} onUploaded={setMainimage} />

          {/* 产品多图 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">产品多图</label>
            <p className="text-xs text-gray-500 mb-2">可以选择多个图片文件同时上传</p>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {images.map((imagePath, index) => (
                  <div key={index} className="relative group">
                    <img src={imagePath} alt="" className="w-16 h-16 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-[#DD773F]/10 file:text-[#DD773F]"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  const uploadPromises = files.map(async (file) => {
                    const formData = new FormData();
                    formData.append("file", file);
                    try {
                      const response = await fetch("/api/upload", { method: "POST", body: formData } as RequestInit);
                      if (response.ok) {
                        const data = await response.json();
                        return data.filePath;
                      }
                      return null;
                    } catch {
                      return null;
                    }
                  });
                  const uploadedPaths = await Promise.all(uploadPromises);
                  const validPaths = uploadedPaths.filter((path) => path !== null);
                  if (validPaths.length > 0) setImages([...images, ...validPaths]);
                  e.target.value = "";
                }
              }}
            />
          </div>

          {/* 产品规格 - 支持从 Excel 粘贴 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">产品规格参数</label>
              <div className="flex items-center gap-2">
                {specs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { if (window.confirm("确定清空所有规格？")) setSpecs([]); }}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition"
                  >
                    清空
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSpecs([...specs, ["", ""]])}
                  className="text-xs bg-[#DD773F] text-white px-2 py-1 rounded hover:bg-[#c05e2d] flex items-center gap-1"
                >
                  <Plus size={12} /> 添加行
                </button>
              </div>
            </div>

            {/* 粘贴区域 */}
            <div
              className="relative mb-3 border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-[#DD773F]/50 transition cursor-text focus-within:border-[#DD773F]"
            >
              <textarea
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none"
                rows={3}
                placeholder={"从 Excel 复制后粘贴到这里，自动解析为表格\n格式：每行一条规格，名称和值之间用 Tab 分隔\n例如：\n最大气压\t150 PSI\n工作电压\t12V DC"}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text/plain");
                  if (!text.trim()) return;
                  const parsed = parseTSV(text);
                  if (parsed.length > 0) {
                    setSpecs([...specs, ...parsed]);
                    (e.target as HTMLTextAreaElement).value = "";
                    addToast(`已导入 ${parsed.length} 条规格`, "success");
                  }
                }}
                onChange={(e) => {
                  // 手动输入：按回车触发解析
                  const text = e.target.value;
                  if (text.includes("\n")) {
                    const parsed = parseTSV(text);
                    if (parsed.length > 0) {
                      setSpecs([...specs, ...parsed]);
                      e.target.value = "";
                    }
                  }
                }}
              />
              <div className="absolute top-2 right-3 pointer-events-none">
                <span className="text-[10px] text-gray-400 bg-white px-1">Ctrl+V 粘贴</span>
              </div>
            </div>

            {/* 规格表格 */}
            {specs.length > 0 && (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 w-8">#</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 w-[35%]">规格名称</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">规格值</th>
                      <th className="px-2 py-2 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {specs.map((spec, index) => (
                      <tr key={index} className="border-t border-gray-200 group hover:bg-gray-50">
                        <td className="px-3 py-1 text-xs text-gray-400">{index + 1}</td>
                        <td className="px-1 py-1">
                          <input
                            type="text"
                            placeholder="如：最大气压"
                            value={spec[0]}
                            onChange={(e) => {
                              const newSpecs = [...specs];
                              newSpecs[index][0] = e.target.value;
                              setSpecs(newSpecs);
                            }}
                            className="w-full px-2 py-1.5 text-sm text-gray-900 bg-transparent border-0 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#DD773F] rounded"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="text"
                            placeholder="如：150 PSI"
                            value={spec[1]}
                            onChange={(e) => {
                              const newSpecs = [...specs];
                              newSpecs[index][1] = e.target.value;
                              setSpecs(newSpecs);
                            }}
                            className="w-full px-2 py-1.5 text-sm text-gray-900 bg-transparent border-0 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#DD773F] rounded"
                          />
                        </td>
                        <td className="px-1 py-1 text-center">
                          <button
                            type="button"
                            onClick={() => setSpecs(specs.filter((_, i) => i !== index))}
                            className="text-gray-300 hover:text-red-500 transition p-1 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <SubmitButton loading={postproductsloading} label="添加产品" loadingLabel="添加中..." />
        </form>
      </SectionCard>

      <SectionCard title="产品列表">
        {product.length === 0 ? (
          <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">暂无产品数据</div>
        ) : (
          <div className="space-y-2">
            {product.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  {p.mainimage && (
                    <img src={p.mainimage} alt={p.name} className="w-10 h-10 object-cover rounded" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                    {p.category && <div className="text-xs text-gray-500">{p.category}</div>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`确定要删除产品「${p.name}」吗？`)) deleteProduct(p.name);
                  }}
                  className="text-red-400 hover:text-red-600 transition p-2"
                  disabled={deleteproductsLoading}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-6">
      <SectionCard title="关于公司 - 大图修改">
        <form onSubmit={handleSubmitAboutBanner} className="space-y-4">
          <ImageUploader label="大图图片" hint="建议比例 16:7" value={aboutBanner} onUploaded={setAboutBanner} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">大标题</label>
            <input
              type="text"
              placeholder="大标题"
              value={mainTitle}
              onChange={(e) => setMainTitle(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">副标题</label>
            <input
              type="text"
              placeholder="副标题"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
            />
          </div>
          <SubmitButton loading={postaboutDataloading} />
        </form>
      </SectionCard>

      <SectionCard title="关于公司 - 具体内容">
        <form onSubmit={handleSubmitAboutDetail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公司具体简介内容</label>
            <textarea
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              value={AboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="例如：我们是一家专注于微型充气泵研发与制造的高新技术企业..."
              rows={5}
              required
            />
          </div>
          <ImageUploader label="简介配图" value={AboutImage} onUploaded={setAboutImage} />
          <SubmitButton loading={postaboutdetailDataloading} />
        </form>
      </SectionCard>

      <SectionCard title="企业文化">
        <form onSubmit={handleSubmitCompanyCulture} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">品牌介绍</label>
            <textarea
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              value={brandIntroduction}
              onChange={(e) => setBrandIntroduction(e.target.value)}
              placeholder="例如：巴克斯通以智能微型多功能车载充气泵..."
              rows={4}
              required
            />
          </div>
          <ImageUploader label="业务开展配图" value={operationImage} onUploaded={setOperationImage} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">经营理念</label>
            <textarea
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              value={managementIdea}
              onChange={(e) => setManagementIdea(e.target.value)}
              placeholder="例如：公司坚持'以人为本、顾客至上、持续经营、技术创新'..."
              rows={3}
              required
            />
          </div>

          {/* 服务宣言 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">服务宣言</label>
              <button
                type="button"
                onClick={() => setDeclaration([...declaration, ""])}
                className="text-xs bg-[#DD773F] text-white px-2 py-1 rounded hover:bg-[#c05e2d] flex items-center gap-1"
              >
                <Plus size={12} /> 添加宣言
              </button>
            </div>
            {declaration.length === 0 && (
              <div className="text-gray-500 text-xs bg-gray-50 p-3 rounded-lg">暂无宣言，点击"添加宣言"开始</div>
            )}
            {declaration.map((line, index) => (
              <div key={index} className="flex gap-2 items-start mb-2">
                <span className="text-xs text-gray-400 mt-2 w-6 text-right">{index + 1}.</span>
                <textarea
                  placeholder={`宣言 ${index + 1}`}
                  value={line}
                  onChange={(e) => {
                    const newDecl = [...declaration];
                    newDecl[index] = e.target.value;
                    setDeclaration(newDecl);
                  }}
                  className="flex-1 border border-gray-300 px-3 py-1.5 rounded-lg text-sm text-gray-900"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => setDeclaration(declaration.filter((_, i) => i !== index))}
                  className="text-red-400 hover:text-red-600 transition p-1 mt-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <SubmitButton loading={postcompanyCultureloading} />
        </form>
      </SectionCard>
    </div>
  );

  const renderNews = () => (
    <div className="space-y-6">
      <SectionCard title="添加新闻">
        <form onSubmit={handleSubmitNews} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新闻标题</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新闻简介</label>
            <textarea
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">上传 PDF 新闻</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-[#DD773F]/10 file:text-[#DD773F]"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const formData = new FormData();
                formData.append("file", file);
                try {
                  const response = await fetch("/api/upload-pdf", { method: "POST", body: formData } as RequestInit);
                  if (response.ok) {
                    const data = await response.json();
                    setPdfUrl(data.filePath);
                  } else {
                    throw new Error("上传失败");
                  }
                } catch {
                  alert("PDF上传失败，请重试");
                }
              }}
              required
            />
            {pdfUrl && <div className="text-xs text-green-600 mt-1">已上传: {pdfUrl}</div>}
          </div>
          <SubmitButton loading={postnewDataLoading} label="发布新闻" loadingLabel="发布中..." />
        </form>
      </SectionCard>

      <SectionCard title="删除新闻">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="输入要删除的新闻标题"
            value={deletetotitle}
            onChange={(e) => setDeletetotitle(e.target.value)}
            className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
          />
          <button
            type="button"
            onClick={() => {
              if (deletetotitle && window.confirm(`确定要删除标题为「${deletetotitle}」的新闻吗？`)) {
                deleteNews(deletetotitle);
              }
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition flex items-center gap-1 whitespace-nowrap disabled:opacity-50"
            disabled={deletenewsLoading}
          >
            <Trash2 size={14} /> {deletenewsLoading ? "删除中..." : "删除"}
          </button>
        </div>
      </SectionCard>
    </div>
  );

  const renderContact = () => (
    <div className="space-y-6">
      <SectionCard title="联系方式信息">
        <form onSubmit={handleSubmitAddress} className="space-y-4">
          <ImageUploader label="联系方式背景大图" value={contactBg} onUploaded={setContactBg} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">联系邮箱</label>
              <input
                type="text"
                placeholder="联系邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
              <input
                type="text"
                placeholder="联系电话"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公司地址</label>
            <input
              type="text"
              placeholder="公司地址"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">工厂地址</label>
            <input
              type="text"
              placeholder="工厂地址"
              value={adddress}
              onChange={(e) => setAdddress(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
            />
          </div>
          <SubmitButton loading={postaddressloading} />
        </form>
      </SectionCard>
    </div>
  );

  const renderShop = () => (
    <div className="space-y-6">
      <SectionCard title="店铺二维码">
        <form onSubmit={handleSubmitShopURL} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUploader label="京东二维码" value={jd} onUploaded={setJd} />
            <ImageUploader label="抖音二维码" value={dy} onUploaded={setDy} />
            <ImageUploader label="微信二维码" value={wx} onUploaded={setWx} />
            <ImageUploader label="微信公众号二维码" value={wxgzh} onUploaded={setWxgzh} />
          </div>
          <SubmitButton loading={postshopURLDataloading} />
        </form>
      </SectionCard>
    </div>
  );

  const renderCerts = () => (
    <div className="space-y-6">
      <SectionCard title="添加资质证书">
        <form onSubmit={handleSubmitCertification} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">证书标题</label>
              <input
                type="text"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
                value={certTitle}
                onChange={(e) => setCertTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">证书副标题（可选）</label>
              <input
                type="text"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
                value={certSubtitle}
                onChange={(e) => setCertSubtitle(e.target.value)}
              />
            </div>
          </div>
          <ImageUploader label="证书图片" value={certSrc} onUploaded={setCertSrc} />
          <SubmitButton loading={postCertLoading} label="添加证书" loadingLabel="添加中..." />
        </form>
      </SectionCard>

      <SectionCard title="证书列表">
        {certifications.length === 0 ? (
          <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">暂无证书数据</div>
        ) : (
          <div className="space-y-2">
            {certifications.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  {item.src && <img src={item.src} alt={item.title} className="w-12 h-12 object-cover rounded" />}
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    {item.subtitle && <div className="text-xs text-gray-500">{item.subtitle}</div>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`确定要删除证书「${item.title}」吗？`)) deleteCertification(item.title);
                  }}
                  className="text-red-400 hover:text-red-600 transition p-2"
                  disabled={deleteCertLoading}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );

  const renderRecruit = () => (
    <div className="space-y-6">
      <SectionCard title="招聘页面设置">
        <form onSubmit={handleSubmitRecruitmentSettings} className="space-y-4">
          <ImageUploader label="招聘页横幅图" value={recBannerImage} onUploaded={setRecBannerImage} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">横幅标题</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              value={recBannerTitle}
              onChange={(e) => setRecBannerTitle(e.target.value)}
            />
          </div>
          <SubmitButton loading={postRecruitmentSettingsLoading} />
        </form>
      </SectionCard>

      <SectionCard title="职位分类管理">
        <form onSubmit={handleSubmitJobCategory} className="space-y-4 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              value={newJobCategoryName}
              onChange={(e) => setNewJobCategoryName(e.target.value)}
              placeholder="新增分类名称，例如：市场类"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#DD773F] text-white rounded-lg text-sm font-medium hover:bg-[#c05e2d] transition flex items-center gap-1 whitespace-nowrap disabled:opacity-50"
              disabled={postJobCategoryLoading}
            >
              <Plus size={14} /> 添加
            </button>
          </div>
        </form>

        {jobCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {jobCategories.map((cat) => (
              <div key={cat} className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-800">
                {cat}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`确定要删除分类「${cat}」吗？`)) deleteJobCategory(cat);
                  }}
                  className="ml-1 text-gray-400 hover:text-red-500 transition"
                  disabled={deleteJobCategoryLoading}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="新增职位">
        <form onSubmit={handleSubmitJob} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">职位名称</label>
              <input
                type="text"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="例如：市场专员"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">工作地点</label>
              <input
                type="text"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                placeholder="例如：上海"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">职位分类</label>
              <select
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
                value={jobCategory}
                onChange={(e) => setJobCategory(e.target.value)}
                required
              >
                <option value="" disabled>
                  请选择分类
                </option>
                {jobCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">职位描述</label>
            <textarea
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-900"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="例如：协助市场活动推广与品牌宣传"
              rows={3}
            />
          </div>
          <SubmitButton loading={postJobLoading} label="新增职位" loadingLabel="添加中..." />
        </form>
      </SectionCard>

      <SectionCard title="职位列表">
        {jobs.length === 0 ? (
          <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">暂无职位数据</div>
        ) : (
          <div className="space-y-2">
            {jobs.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-xs text-gray-500">
                    {item.location} · {item.category}
                  </div>
                  {item.description && <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`确定要删除职位「${item.title}」吗？`)) deleteJob(item.title);
                  }}
                  className="text-red-400 hover:text-red-600 transition p-2"
                  disabled={deleteJobLoading}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "home": return renderHome();
      case "products": return renderProducts();
      case "about": return renderAbout();
      case "news": return renderNews();
      case "contact": return renderContact();
      case "shop": return renderShop();
      case "certs": return renderCerts();
      case "recruit": return renderRecruit();
    }
  };

  // ==================== Layout ====================

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-40 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 text-gray-600">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-lg font-bold text-gray-800">后台管理</h1>
        <div className="w-8" />
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">后台管理</h1>
          <p className="text-xs text-gray-500 mt-1">内容管理系统</p>
        </div>

        <nav className="p-3 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-[#DD773F]/10 text-[#DD773F]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={18} />
                {tab.label}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        {/* API Key bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3 mt-0 lg:mt-0">
          <div className="flex items-center gap-3 max-w-4xl">
            <Key size={16} className="text-gray-400 shrink-0" />
            <div className="relative flex-1">
              <input
                type={showApiKey ? "text" : "password"}
                className="w-full border border-gray-300 px-3 py-1.5 pr-9 rounded-lg text-sm text-gray-900 focus:border-[#DD773F] focus:ring-1 focus:ring-[#DD773F] transition"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="请输入 API 密钥..."
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div
              className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                apiKey ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {apiKey ? "已设置" : "未设置"}
            </div>
          </div>
        </div>

        {/* Page header */}
        <div className="px-6 pt-6 pb-2 lg:pt-6 pt-20">
          <h2 className="text-2xl font-bold text-gray-800">
            {TABS.find((t) => t.key === activeTab)?.label}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 pb-10 max-w-4xl">{renderActiveTab()}</div>
      </main>

      {/* Global animation styles */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
