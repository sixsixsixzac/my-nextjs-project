"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PenTool, FileText, Clock, CheckCircle2, Plus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface WriterLayoutProps {
  children: ReactNode
}

export function WriterLayout({ children }: WriterLayoutProps) {
  return (
    <>
      <div className="space-y-6">
        {/* Writer Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <PenTool className="h-8 w-8 text-primary" />
              Writer Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Create, manage, and publish your content
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-sm px-3 py-1">
              Writer
            </Badge>
            <Button asChild>
              <Link href="/posts/create">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Link>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Writer Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Total published posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Upcoming posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <PenTool className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5K</div>
              <p className="text-xs text-muted-foreground">All-time views</p>
            </CardContent>
          </Card>
        </div>

        {/* Writer Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Content
              </CardTitle>
              <CardDescription>
                View and manage all your posts
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Drafts
              </CardTitle>
              <CardDescription>
                Continue working on your drafts
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Separator />

        {/* Writer Content Area */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </>
  )
}

