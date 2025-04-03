
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Search, BookOpen, Download, Star, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Badge } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ClinicalResources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("guidelines");
  
  const resources = {
    guidelines: [
      {
        id: 1,
        title: "Type 2 Diabetes Management Guidelines",
        organization: "American Diabetes Association",
        year: "2025",
        tags: ["diabetes", "endocrinology"],
        featured: true
      },
      {
        id: 2,
        title: "Parkinson's Disease Treatment Protocol",
        organization: "Movement Disorder Society",
        year: "2024",
        tags: ["neurological", "movement disorders"],
        featured: false
      },
      {
        id: 3,
        title: "Multiple Sclerosis: Clinical Practice Guidelines",
        organization: "American Academy of Neurology",
        year: "2025",
        tags: ["neurological", "autoimmune"],
        featured: true
      },
    ],
    journals: [
      {
        id: 1,
        title: "Advances in Early Detection of Neurodegenerative Disorders",
        journal: "Journal of Neurology",
        date: "March 2025",
        tags: ["neurological", "research", "diagnostics"],
        featured: true
      },
      {
        id: 2,
        title: "AI Applications in Disability Assessment and Intervention",
        journal: "Artificial Intelligence in Medicine",
        date: "February 2025",
        tags: ["AI", "intervention", "assessment"],
        featured: false
      },
      {
        id: 3,
        title: "Comparative Study of Disability Assistive Technologies",
        journal: "Disability and Rehabilitation: Assistive Technology",
        date: "January 2025",
        tags: ["technology", "mobility", "adaptive"],
        featured: false
      }
    ],
    tools: [
      {
        id: 1,
        title: "Disability Assessment Protocol",
        type: "Assessment Tool",
        lastUpdated: "April 2025",
        tags: ["assessment", "clinical", "protocol"],
        featured: false
      },
      {
        id: 2,
        title: "Mobility Score Calculator",
        type: "Clinical Calculator",
        lastUpdated: "March 2025",
        tags: ["mobility", "evaluation", "metrics"],
        featured: true
      },
      {
        id: 3,
        title: "Patient Education Materials - Visual Impairment",
        type: "Education Resource",
        lastUpdated: "February 2025",
        tags: ["visual", "patient education", "materials"],
        featured: false
      }
    ]
  };
  
  const filteredResources = resources[activeTab as keyof typeof resources].filter(
    (resource) => {
      if (!searchQuery) return true;
      
      const lowerQuery = searchQuery.toLowerCase();
      
      // Search in title
      if (resource.title.toLowerCase().includes(lowerQuery)) return true;
      
      // Search in tags
      if (resource.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;
      
      // Search in other fields depending on resource type
      if ("organization" in resource && resource.organization.toLowerCase().includes(lowerQuery)) return true;
      if ("journal" in resource && resource.journal.toLowerCase().includes(lowerQuery)) return true;
      if ("type" in resource && resource.type.toLowerCase().includes(lowerQuery)) return true;
      
      return false;
    }
  );
  
  // Voice commands
  const voiceCommands = [
    {
      command: "go back",
      action: () => window.history.back(),
      description: "going back to previous page",
      category: "navigation" as const,
    },
    {
      command: "show journals",
      action: () => setActiveTab("journals"),
      description: "showing medical journals",
      category: "navigation" as const,
    },
    {
      command: "search for diabetes",
      action: () => setSearchQuery("diabetes"),
      description: "searching for diabetes resources",
      category: "navigation" as const,
    },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <BookOpen className="h-8 w-8 mr-2 text-primary" />
            Clinical Resources
          </h1>
          <p className="text-muted-foreground mt-1">
            Access the latest research, clinical guidelines, and tools
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Button className="absolute right-2 top-2" variant="ghost" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            <TabsTrigger value="journals">Journals</TabsTrigger>
            <TabsTrigger value="tools">Clinical Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="guidelines" className="space-y-4">
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map((resource: any) => (
                  <Card key={resource.id} className={resource.featured ? "border-primary" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {resource.title}
                        </CardTitle>
                        {resource.featured && (
                          <Star className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {resource.organization} • {resource.year}
                        </span>
                        
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {resource.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 font-medium">No guidelines found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search query
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="journals" className="space-y-4">
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map((resource: any) => (
                  <Card key={resource.id} className={resource.featured ? "border-primary" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {resource.title}
                        </CardTitle>
                        {resource.featured && (
                          <Star className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {resource.journal} • {resource.date}
                        </span>
                        
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {resource.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 font-medium">No journals found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search query
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tools" className="space-y-4">
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map((resource: any) => (
                  <Card key={resource.id} className={resource.featured ? "border-primary" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {resource.title}
                        </CardTitle>
                        {resource.featured && (
                          <Star className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {resource.type} • Last updated: {resource.lastUpdated}
                        </span>
                        
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Access
                        </Button>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {resource.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 font-medium">No tools found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search query
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
