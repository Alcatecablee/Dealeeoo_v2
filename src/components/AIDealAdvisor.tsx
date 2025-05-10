import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Wand2, Info } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AIDealAdvisorProps {
  onSuggestionSelect?: (suggestion: string) => void;
}

const SAMPLE_SUGGESTIONS = [
  {
    title: "Website Development Project",
    description: "Agreement for the design and development of a responsive website with e-commerce functionality. Payment will be released upon successful completion and testing of all features. Includes:\n\n- 5-page responsive website\n- E-commerce integration\n- SEO optimization\n- 3 months of support\n- 2 rounds of revisions"
  },
  {
    title: "Logo & Brand Design Package",
    description: "Creation of a professional logo and brand identity package. Deliverables include:\n\n- Primary logo design\n- Alternative logo variations\n- Brand color palette\n- Typography guidelines\n- Social media assets\n- Brand usage guidelines\n\nPayment will be released upon approval of final designs with up to 3 revision rounds."
  },
  {
    title: "Content Writing Services",
    description: "Professional content writing package for your business. Includes:\n\n- 5 blog posts (1500 words each)\n- SEO optimization\n- Keyword research\n- Meta descriptions\n- Social media snippets\n\nPayment will be released upon approval of all articles with up to 2 revision rounds per article."
  },
  {
    title: "Mobile App Development",
    description: "Development of a cross-platform mobile application. Features include:\n\n- User authentication\n- Real-time data sync\n- Push notifications\n- Offline functionality\n- App store submission\n\nPayment will be released in milestones:\n1. 30% upon design approval\n2. 40% upon beta testing\n3. 30% upon app store approval"
  }
];

const AIDealAdvisor: React.FC<AIDealAdvisorProps> = ({ onSuggestionSelect }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuggestion, setGeneratedSuggestion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate AI generation with a random suggestion
    setTimeout(() => {
      const randomSuggestion = SAMPLE_SUGGESTIONS[Math.floor(Math.random() * SAMPLE_SUGGESTIONS.length)];
      setGeneratedSuggestion(`${randomSuggestion.title}\n\n${randomSuggestion.description}`);
      setIsGenerating(false);
    }, 1500);
  };

  const handleUseSuggestion = () => {
    if (generatedSuggestion && onSuggestionSelect) {
      onSuggestionSelect(generatedSuggestion);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    const suggestion = SAMPLE_SUGGESTIONS.find(s => s.title.toLowerCase().includes(category.toLowerCase()));
    if (suggestion) {
      setGeneratedSuggestion(`${suggestion.title}\n\n${suggestion.description}`);
    }
  };

  return (
    <AnimatedSection delay={200}>
      <Card className="border-2 border-friendly-purple/30 shadow-md hover:shadow-friendly-purple/20 transition-shadow">
        <CardHeader className="bg-gradient-to-r from-friendly-blue/10 to-friendly-purple/10">
          <CardTitle className="flex items-center text-xl text-gradient-friendly">
            <Sparkles className="w-5 h-5 mr-2 text-friendly-purple" />
            AI Deal Advisor
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            Let our AI suggest deal terms based on your needs
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Our AI will analyze your requirements and suggest appropriate deal terms and conditions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-5">
          <div className="space-y-6">
            <div>
              <label htmlFor="prompt" className="text-sm font-medium text-gray-700 mb-1 block">Describe what your deal is about</label>
              <Textarea
                id="prompt"
                placeholder="E.g., I need a website developer to create a 5-page business site with contact form..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-24 border-friendly-purple/20 focus:border-friendly-purple focus:ring-friendly-purple/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {['Website', 'Design', 'Content', 'App'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`w-full ${
                    selectedCategory === category 
                      ? 'bg-friendly-purple text-white' 
                      : 'border-friendly-purple/30 text-friendly-purple hover:bg-friendly-purple/10'
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            {generatedSuggestion && (
              <div className="bg-gradient-to-r from-friendly-blue/5 to-friendly-purple/5 rounded-lg p-4 border border-friendly-purple/20">
                <div className="flex items-center gap-2 mb-2">
                  <Wand2 className="w-4 h-4 text-friendly-purple" />
                  <h4 className="text-sm font-medium text-friendly-purple">AI Suggestion</h4>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 whitespace-pre-wrap">{generatedSuggestion}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-gradient-friendly hover:opacity-90 transition-opacity"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Suggestion
              </>
            )}
          </Button>
          
          {generatedSuggestion && (
            <Button 
              onClick={handleUseSuggestion} 
              variant="outline"
              className="border-friendly-purple/30 text-friendly-purple hover:bg-friendly-purple/10"
            >
              Use This Suggestion
            </Button>
          )}
        </CardFooter>
      </Card>
    </AnimatedSection>
  );
};

export default AIDealAdvisor;
