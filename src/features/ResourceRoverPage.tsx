

import React, { useState, useCallback } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import { generateText } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import SearchIcon from '../components/icons/SearchIcon';
import { GroundingChunk } from '../types';
import { useToast } from '../hooks/useToast'; 

interface SearchResult {
  text: string;
  sources?: GroundingChunk[];
}

const ResourceRoverPage: React.FC = () => {
  const { settings } = useSettings(); 
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setError("Please enter a search query.");
      addToast("Please enter a search query.", "warning");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    let prompt = `Find academic resources and information about: "${query}". 
    Provide a concise summary of the findings and list relevant sources. 
    Focus on information that would be useful for a ${settings.academicLevel} student.
    If the query is about recent events or requires up-to-date information, prioritize that.`;

    if (settings.geographicRegion === 'Nigeria') {
        prompt += `\nStrongly prioritize Nigerian journals, university e-libraries, local research databases (e.g., NUC resources, TEEAL if relevant), and open access African journals in your search and sourced information.`;
    }
    
    const result = await generateText(prompt, { ...settings, useGrounding: true });

    if (result.error) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      setSearchResult({ text: result.text, sources: result.sources });
      addToast("Search complete!", "success");
    }
    setIsLoading(false);
  }, [query, settings, addToast]);

  const handleClearSearch = () => {
    setQuery('');
    setSearchResult(null);
    setError(null);
    addToast('Search cleared.', 'info');
  };

  return (
    <div className="space-y-6">
      <header className="pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center">
          <SearchIcon className="h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary" />
          Resource Rover
        </h1>
        <p className="mt-1 text-muted-foreground dark:text-dark-muted-foreground">Discover academic articles, papers, and information using AI-powered search with web grounding.</p>
      </header>

      <Card title="Search for Academic Resources">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-end">
          <Input
            label="Search Query"
            id="searchQuery"
            placeholder="e.g., 'latest advancements in renewable energy storage', 'effects of social media on adolescent psychology'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            containerClassName="flex-grow"
          />
          <div className="flex gap-2 w-full sm:w-auto">
            {query && (
              <Button onClick={handleClearSearch} variant="outline" disabled={isLoading} className="h-10 w-full sm:w-auto">
                Clear
              </Button>
            )}
            <Button onClick={handleSearch} isLoading={isLoading} disabled={!query.trim()} className="h-10 w-full sm:w-auto">
              Search
            </Button>
          </div>
        </div>
      </Card>
      
      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading && <Spinner text="Rover is searching the web for academic resources..." />}
        {error && !isLoading && (
          <Card className="bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:text-destructive">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </Card>
        )}

        {!isLoading && !searchResult && !error && !query.trim() && (
          <Card>
            <div className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
                <SearchIcon className="h-12 w-12 mx-auto text-primary/30 dark:text-dark-primary/30 mb-4" />
                <p className="font-semibold text-lg">Ready to Explore?</p>
                <p className="text-sm">Enter your search query above to find academic resources.</p>
            </div>
          </Card>
        )}

        {!isLoading && searchResult && (
          <Card title="Search Results">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold mb-2">Summary:</h3>
              <p className="text-muted-foreground dark:text-dark-muted-foreground whitespace-pre-wrap">{searchResult.text || "No summary provided."}</p>
            </div>

            {searchResult.sources && searchResult.sources.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Sources:</h3>
                <ul className="list-disc list-inside space-y-2">
                  {searchResult.sources.map((sourceItem, index) => {
                    const source = sourceItem.web || sourceItem.retrievedContext; 
                    if (!source || !source.uri) return null;
                    return (
                      <li key={index} className="text-sm">
                        <a
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline dark:text-dark-primary break-all"
                        >
                          {source.title || source.uri}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {(!searchResult.sources || searchResult.sources.length === 0) && (
              <p className="mt-4 text-sm text-muted-foreground dark:text-dark-muted-foreground">No specific web sources were cited for this summary.</p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResourceRoverPage;