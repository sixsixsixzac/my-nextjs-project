"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SearchFilters as SearchFiltersType } from "@/lib/api/mockSearchApi";
import { Search, X } from "lucide-react";

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFiltersType) => void;
  initialFilters?: SearchFiltersType;
  onClearFilters?: () => void;
}

export function SearchFilters({
  onFiltersChange,
  initialFilters = {},
  onClearFilters,
}: SearchFiltersProps) {
  const [name, setName] = useState(initialFilters.name || "");
  const [cartoonType, setCartoonType] = useState<
    "all" | "manga" | "novel"
  >(initialFilters.cartoonType || "all");
  const [orderBy, setOrderBy] = useState<
    "relevance" | "views" | "likes" | "latest" | "chapters" | "latest_update"
  >(initialFilters.orderBy || "latest_update");
  const [mainCategory, setMainCategory] = useState<string>(
    initialFilters.mainCategory || "all"
  );
  const [subCategory, setSubCategory] = useState<string>(
    initialFilters.subCategory || "all"
  );
  const [age, setAge] = useState<"all" | "all_ages" | "teen" | "mature">(
    initialFilters.age || "all"
  );
  const [completeStatus, setCompleteStatus] = useState<
    "all" | "completed" | "ongoing"
  >(initialFilters.complete_status || "all");
  const [original, setOriginal] = useState<"all" | "original" | "adaptation">(
    initialFilters.original || "all"
  );

  const updateFilters = (updates: Partial<SearchFiltersType>) => {
    const newFilters: SearchFiltersType = {
      name,
      cartoonType,
      orderBy,
      mainCategory,
      subCategory,
      age,
      complete_status: completeStatus,
      original,
      ...updates,
    };
    onFiltersChange(newFilters);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    updateFilters({ name: value });
  };

  const handleSearch = () => {
    updateFilters({});
  };

  const handleCartoonTypeChange = (value: "all" | "manga" | "novel") => {
    setCartoonType(value);
    updateFilters({ cartoonType: value });
  };

  const handleOrderByChange = (
    value: "relevance" | "views" | "likes" | "latest" | "chapters" | "latest_update"
  ) => {
    setOrderBy(value);
    updateFilters({ orderBy: value });
  };

  const handleMainCategoryChange = (value: string) => {
    setMainCategory(value);
    updateFilters({ mainCategory: value });
  };

  const handleSubCategoryChange = (value: string) => {
    setSubCategory(value);
    updateFilters({ subCategory: value });
  };

  const handleAgeChange = (value: "all" | "all_ages" | "teen" | "mature") => {
    setAge(value);
    updateFilters({ age: value });
  };

  const handleCompleteStatusChange = (
    value: "all" | "completed" | "ongoing"
  ) => {
    setCompleteStatus(value);
    updateFilters({ complete_status: value });
  };

  const handleOriginalChange = (value: "all" | "original" | "adaptation") => {
    setOriginal(value);
    updateFilters({ original: value });
  };

  const handleClearFilters = () => {
    setName("");
    setCartoonType("all");
    setOrderBy("latest_update");
    setMainCategory("all");
    setSubCategory("all");
    setAge("all");
    setCompleteStatus("all");
    setOriginal("all");
    
    const clearedFilters: SearchFiltersType = {
      name: "",
      cartoonType: "all",
      orderBy: "latest_update",
      mainCategory: "all",
      subCategory: "all",
      age: "all",
      complete_status: "all",
      original: "all",
    };
    
    onFiltersChange(clearedFilters);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="ค้นหามังงะ..."
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="flex-1"
        />
        <Button onClick={handleSearch} className="shrink-0">
          <Search className="size-4" />
          <span>ค้นหา</span>
        </Button>
      </div>

      {/* Filter Panel */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        {/* First Row - 4 columns */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="cartoon-type">ประเภท</Label>
            <Select value={cartoonType} onValueChange={handleCartoonTypeChange}>
              <SelectTrigger id="cartoon-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="manga">มังงะ</SelectItem>
                <SelectItem value="novel">นิยาย</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-by">เรียงตาม</Label>
            <Select value={orderBy} onValueChange={handleOrderByChange}>
              <SelectTrigger id="order-by" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest_update">อัปเดตล่าสุด</SelectItem>
                <SelectItem value="relevance">ความเกี่ยวข้อง</SelectItem>
                <SelectItem value="views">ยอดดู</SelectItem>
                <SelectItem value="likes">ยอดไลค์</SelectItem>
                <SelectItem value="latest">ใหม่ล่าสุด</SelectItem>
                <SelectItem value="chapters">จำนวนตอน</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="main-category">หมวดหมู่หลัก</Label>
            <Select value={mainCategory} onValueChange={handleMainCategoryChange}>
              <SelectTrigger id="main-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="action">แอคชั่น</SelectItem>
                <SelectItem value="romance">โรแมนติก</SelectItem>
                <SelectItem value="fantasy">แฟนตาซี</SelectItem>
                <SelectItem value="adventure">ผจญภัย</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub-category">หมวดหมู่ย่อย</Label>
            <Select value={subCategory} onValueChange={handleSubCategoryChange}>
              <SelectTrigger id="sub-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="shounen">โชเน็น</SelectItem>
                <SelectItem value="shoujo">โชโจ</SelectItem>
                <SelectItem value="seinen">เซเน็น</SelectItem>
                <SelectItem value="josei">โจเซ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Second Row - 3 columns + Clear button */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="age">อายุ</Label>
            <Select value={age} onValueChange={handleAgeChange}>
              <SelectTrigger id="age" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="all_ages">ทุกวัย</SelectItem>
                <SelectItem value="teen">วัยรุ่น</SelectItem>
                <SelectItem value="mature">ผู้ใหญ่</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complete-status">สถานะ</Label>
            <Select
              value={completeStatus}
              onValueChange={handleCompleteStatusChange}
            >
              <SelectTrigger id="complete-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="completed">จบแล้ว</SelectItem>
                <SelectItem value="ongoing">กำลังดำเนิน</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="original">ต้นฉบับ</Label>
            <Select value={original} onValueChange={handleOriginalChange}>
              <SelectTrigger id="original" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="original">ต้นฉบับ</SelectItem>
                <SelectItem value="adaptation">ดัดแปลง</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full"
            >
              <X className="size-4" />
              <span>ล้างตัวกรอง</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
