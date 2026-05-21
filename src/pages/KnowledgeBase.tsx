import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Input } from "@/components/ui/input/input";
import { Badge } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import {
  Search, BookOpen, FileText, Video, HelpCircle, Clock, Eye,
  ThumbsUp, ThumbsDown, ChevronRight, Star, TrendingUp, Bookmark,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  updatedAt: string;
  readTime: string;
  type: "article" | "video" | "faq";
  featured?: boolean;
  content: string;
}

const categories = [
  { id: "all", label: "All", icon: BookOpen },
  { id: "billing", label: "Billing", icon: FileText },
  { id: "technical", label: "Technical", icon: HelpCircle },
  { id: "onboarding", label: "Onboarding", icon: TrendingUp },
  { id: "policies", label: "Policies", icon: Bookmark },
];

const seedArticles: Article[] = [
  { id: "kb-1", title: "How to Process a Refund", excerpt: "Step-by-step guide for processing full or partial refunds through the billing system.", category: "billing", tags: ["refund", "billing", "payments"], views: 1247, helpful: 94, updatedAt: "2025-02-10", readTime: "3 min", type: "article", featured: true, content: "Navigate to Billing > Customer Account > Transactions. Select the transaction, click 'Refund', choose full or partial, enter the amount, and confirm. Refunds process within 3-5 business days." },
  { id: "kb-2", title: "Escalation Procedures for Critical Tickets", excerpt: "When and how to escalate tickets to Tier 2 or management for urgent customer issues.", category: "policies", tags: ["escalation", "SLA", "critical"], views: 892, helpful: 87, updatedAt: "2025-02-08", readTime: "5 min", type: "article", featured: true, content: "Critical tickets (SLA breach imminent) must be escalated within 15 minutes. Use the ticket action menu > Escalate. Select the appropriate tier and add context notes." },
  { id: "kb-3", title: "Setting Up a New Business Account (B2B)", excerpt: "Complete walkthrough for onboarding enterprise and SMB customers including credit checks.", category: "onboarding", tags: ["B2B", "enterprise", "setup"], views: 654, helpful: 91, updatedAt: "2025-02-05", readTime: "7 min", type: "article", content: "Go to New Customer > B2B. Complete company details, run credit check via the integrated API, set payment terms (Net 30/60/90), assign account manager, and configure service packages." },
  { id: "kb-4", title: "Troubleshooting Broadband Speed Issues", excerpt: "Diagnostic steps for customers reporting slow internet speeds or intermittent connectivity.", category: "technical", tags: ["broadband", "speed", "diagnostics"], views: 2103, helpful: 88, updatedAt: "2025-02-12", readTime: "4 min", type: "article", featured: true, content: "1. Check line status in the network dashboard. 2. Run remote speed test. 3. Check for area outages. 4. Guide customer through router restart. 5. If persists, book engineer visit." },
  { id: "kb-5", title: "Video: Using the Customer 360 View", excerpt: "Quick tutorial on navigating the unified customer view and its key sections.", category: "onboarding", tags: ["training", "customer-360", "UI"], views: 445, helpful: 96, updatedAt: "2025-01-28", readTime: "6 min", type: "video", content: "This video covers: Navigating to Customer 360, understanding the coverage panel, viewing billing history, managing tickets, and using the retention tools." },
  { id: "kb-6", title: "Credit Note & Adjustment Policy", excerpt: "Guidelines for issuing credit notes, billing adjustments, and approval thresholds.", category: "billing", tags: ["credit", "adjustment", "policy"], views: 789, helpful: 82, updatedAt: "2025-02-01", readTime: "4 min", type: "article", content: "Adjustments under £50 can be auto-approved by agents. £50-£200 require supervisor approval. Over £200 requires admin approval. All adjustments are logged in the audit trail." },
  { id: "kb-7", title: "FAQ: Contract Renewal Process", excerpt: "Common questions about contract renewals, early termination, and upgrade paths.", category: "policies", tags: ["contracts", "renewal", "FAQ"], views: 567, helpful: 90, updatedAt: "2025-02-06", readTime: "3 min", type: "faq", content: "Q: When can a customer renew? A: 90 days before expiry. Q: Can they upgrade mid-contract? A: Yes, with a new minimum term. Q: Early termination fees? A: Remaining months × monthly charge × 0.5." },
  { id: "kb-8", title: "Leased Line Installation Checklist", excerpt: "Pre-installation requirements and site survey checklist for leased line orders.", category: "technical", tags: ["leased-line", "installation", "checklist"], views: 334, helpful: 95, updatedAt: "2025-02-09", readTime: "5 min", type: "article", content: "1. Confirm site survey date. 2. Verify wayleave permissions. 3. Check power availability at demarcation point. 4. Confirm router specification. 5. Schedule engineer with 48h notice." },
];

export default function KnowledgeBase() {
  const [articles] = useState<Article[]>(seedArticles);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [votes, setVotes] = useState<Record<string, "up" | "down">>({});

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return articles.filter(a => {
      if (category !== "all" && a.category !== category) return false;
      if (!q) return true;
      return a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.tags.some(t => t.includes(q));
    });
  }, [query, category, articles]);

  const featured = articles.filter(a => a.featured);

  const typeIcon = (type: Article["type"]) => {
    if (type === "video") return <Video className="h-3.5 w-3.5 text-destructive" />;
    if (type === "faq") return <HelpCircle className="h-3.5 w-3.5 text-warning" />;
    return <FileText className="h-3.5 w-3.5 text-primary" />;
  };

  if (selectedArticle) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setSelectedArticle(null)}>← Back to Knowledge Base</Button>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              {typeIcon(selectedArticle.type)}
              <span className="capitalize">{selectedArticle.category}</span><span>·</span>
              <Clock className="h-3 w-3" /> {selectedArticle.readTime} read<span>·</span>
              <Eye className="h-3 w-3" /> {selectedArticle.views.toLocaleString()} views
            </div>
            <CardTitle className="text-xl">{selectedArticle.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{selectedArticle.excerpt}</p>
            <div className="flex gap-1.5 mt-2">{selectedArticle.tags.map(tag => (<Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>))}</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none"><p className="text-sm leading-relaxed whitespace-pre-line">{selectedArticle.content}</p></div>
            <div className="border-t pt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Was this article helpful?</p>
              <div className="flex gap-2">
                <Button variant={votes[selectedArticle.id] === "up" ? "default" : "outline"} size="sm" className="gap-1 text-xs" onClick={() => setVotes(v => ({ ...v, [selectedArticle.id]: "up" }))}><ThumbsUp className="h-3 w-3" /> Yes</Button>
                <Button variant={votes[selectedArticle.id] === "down" ? "destructive" : "outline"} size="sm" className="gap-1 text-xs" onClick={() => setVotes(v => ({ ...v, [selectedArticle.id]: "down" }))}><ThumbsDown className="h-3 w-3" /> No</Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Last updated: {selectedArticle.updatedAt}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2"><BookOpen className="h-6 w-6 text-primary" /> Knowledge Base</h1>
        <p className="text-sm text-muted-foreground">Find answers, guides, and procedures</p>
      </div>
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search articles, FAQs, guides…" value={query} onChange={e => setQuery(e.target.value)} className="pl-10 h-11" autoFocus />
      </div>
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="w-full">{categories.map(cat => (<TabsTrigger key={cat.id} value={cat.id} className="flex-1 gap-1.5 text-xs"><cat.icon className="h-3.5 w-3.5" /> {cat.label}</TabsTrigger>))}</TabsList>
      </Tabs>
      {!query && category === "all" && (
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3" /> Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {featured.map(article => (
              <Card key={article.id} className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all" onClick={() => setSelectedArticle(article)}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5">{typeIcon(article.type)}<Badge variant="secondary" className="text-[9px] capitalize">{article.category}</Badge></div>
                  <p className="text-sm font-medium leading-tight">{article.title}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{article.views}</span>
                    <span className="flex items-center gap-0.5"><ThumbsUp className="h-2.5 w-2.5" />{article.helpful}%</span>
                    <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{article.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-2">
        {query || category !== "all" ? (<p className="text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""} found</p>) : (<h2 className="text-xs font-medium text-muted-foreground">All Articles</h2>)}
        <div className="space-y-1.5">
          {filtered.map(article => (
            <Card key={article.id} className="cursor-pointer hover:shadow-sm hover:border-primary/20 transition-all" onClick={() => setSelectedArticle(article)}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">{typeIcon(article.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="text-sm font-medium truncate">{article.title}</p><Badge variant="secondary" className="text-[9px] capitalize shrink-0">{article.category}</Badge></div>
                  <p className="text-[11px] text-muted-foreground truncate">{article.excerpt}</p>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground shrink-0">
                  <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{article.views}</span>
                  <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{article.readTime}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 space-y-2"><Search className="h-8 w-8 text-muted-foreground/30 mx-auto" /><p className="text-sm text-muted-foreground">No articles found matching your search</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
