import{f as I,h as O,y as $,m as A,v as d,u as e,Q as j,a as p,l as R,d as E}from"./index-CL7HjhdV.js";import{b as g}from"./Card-C8Vt2KLr-CXW7Tvcj.js";import{a as D,c as Y}from"./geminiService-DJIPhCmJ-Bm2owfCC.js";import{c as G}from"./downloadHelper-Y0t7dfPR--lPmL3re.js";const L=()=>{const{settings:h}=I(),i=O(),{addToast:o}=$(),{openSaveToDriveModal:N}=A(),[l,x]=d.useState(""),[a,m]=d.useState(null),[n,y]=d.useState(!1),[f,c]=d.useState(null),[K,k]=d.useState(void 0);d.useEffect(()=>{var r;if((r=i.state)!=null&&r.initialText){x(i.state.initialText),i.state.documentName&&k(i.state.documentName);const t=i.state.documentName?` from "${i.state.documentName}"`:"";o(`Project text loaded${t} for Presentation Crafter.`,"info"),window.history.replaceState({},document.title)}},[i.state,o]);const w=d.useCallback(async()=>{if(!l.trim()){c("Please paste your project text to generate a presentation outline."),o("Project text is empty.","warning");return}y(!0),c(null),m(null);const r=`You are an expert academic presentation designer. Based on the following project text, generate a structured outline for a PowerPoint-style presentation.
The outline should include an overall presentation title and a series of slides. Each slide should have a title, key bullet points, and a "suggestedImageType" string. The suggestedImageType should describe a type of visual that would complement the slide (e.g., "Bar chart showing growth", "Conceptual diagram of X", "Photograph of Y", "Timeline of events", "Relevant quote"). Optionally, include brief speaker notes for some slides if appropriate.

Consider a logical flow for an academic presentation, typically including:
-   Introduction (Background, Problem, Objectives, Roadmap)
-   Literature Review (Key concepts, theories, gaps addressed - if substantial in text)
-   Methodology (Design, Data Collection, Analysis)
-   Key Results/Findings (Presented clearly, perhaps one key finding per slide or grouped thematically)
-   Discussion (Interpretation of results, relation to literature, implications)
-   Conclusion (Summary, contributions, future work)
-   Q&A slide

Output the result as a single JSON object with the following structure:
{
  "overallTitle": "A compelling overall title for the presentation",
  "slides": [
    {
      "title": "Slide 1 Title (e.g., Introduction)",
      "bullets": [
        "Key point 1 for this slide",
        "Key point 2 for this slide",
        "Key point 3 for this slide (aim for 3-5 bullets per slide generally)"
      ],
      "suggestedImageType": "e.g., Graph illustrating key statistic from background",
      "speakerNotes": "Optional brief notes for the presenter for this slide."
    },
    {
      "title": "Slide 2 Title (e.g., Methodology)",
      "bullets": ["...", "...", "..."],
      "suggestedImageType": "e.g., Flowchart of research process",
      "speakerNotes": "Optional notes..."
    }
    // ... more slides (aim for 8-12 slides)
  ]
}

Project Text:
"""
${l}
"""

Ensure the output is ONLY a valid JSON object.`,t=await D("",{...h,responseMimeType:"application/json",customPromptOverride:r});if(t.error)c(t.error),o(t.error,"error");else{const s=Y(t.text);s&&s.overallTitle&&Array.isArray(s.slides)&&s.slides.every(u=>u.title&&Array.isArray(u.bullets))?(m(s),o(`Presentation outline for "${s.overallTitle}" generated!`,"success")):(c("AI returned data in an unexpected format. Could not parse presentation outline. Displaying raw output if available."),o("Failed to parse AI response into structured outline.","error"),m({overallTitle:"Error Parsing Response. Raw: "+t.text,slides:[]}))}y(!1)},[l,h,o]),b=r=>{let t=`Presentation Outline
====================

Overall Title: ${r.overallTitle}

`;return r.slides.forEach((s,u)=>{t+=`Slide ${u+1}: ${s.title}
`,t+=`  Bullets:
`,s.bullets.forEach(S=>{t+=`    - ${S}
`}),s.suggestedImageType&&(t+=`  Suggested Image Type: ${s.suggestedImageType}
`),s.speakerNotes&&(t+=`  Speaker Notes: ${s.speakerNotes}
`),t+=`
--------------------

`}),t},v=(r,t)=>{const s=r.replace(/[^\w\s-]/gi,"").replace(/\s+/g,"_")||"PresentationOutline";return`${E} - PresentationCrafter - ${s}.${t}`},T=()=>{if(!a){o("No outline to download.","info");return}const r=b(a),t=v(a.overallTitle,"txt");G(r,t),o("Presentation outline download initiated.","success")},P=()=>{if(!a){o("No outline to save.","info");return}const r=b(a),t=v(a.overallTitle,"txt");N(r,t)},C=()=>{x(""),m(null),c(null),k(void 0),o("Input and outline cleared.","info")};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("header",{className:"pb-4",children:[e.jsxs("h1",{className:"text-2xl md:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground flex items-center",children:[e.jsx(j,{className:"h-7 w-7 md:h-8 md:w-8 mr-2 text-primary dark:text-dark-primary"}),"Presentation Crafter"]}),e.jsx("p",{className:"mt-1 text-muted-foreground dark:text-dark-muted-foreground",children:"Generate a structured outline, including image type suggestions, for your academic presentation."})]}),e.jsxs(g,{title:"Input Your Project Text",children:[e.jsx("textarea",{value:l,onChange:r=>x(r.target.value),rows:15,className:"w-full p-2.5 border rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent bg-background dark:bg-dark-input dark:border-dark-border dark:text-dark-foreground dark:placeholder-dark-muted-foreground transition-all",placeholder:"Paste the core text of your project/thesis here...","aria-label":"Project text input for Presentation Crafter"}),e.jsxs("div",{className:"mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2",children:[(l||a)&&e.jsx(p,{onClick:C,variant:"outline",disabled:n,className:"w-full sm:w-auto",children:"Clear All"}),e.jsx(p,{onClick:w,isLoading:n,disabled:!l.trim(),className:"w-full sm:w-auto",children:"Generate Presentation Outline"})]})]}),e.jsxs("div",{"aria-live":"polite","aria-busy":n,children:[n&&e.jsx(R,{text:"Crafting your presentation outline..."}),f&&!n&&e.jsxs(g,{className:"bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:text-destructive",children:[e.jsx("p",{className:"font-semibold",children:"Error Generating Outline"}),e.jsx("p",{className:"text-sm",children:f})]}),!n&&!a&&!f&&!l.trim()&&e.jsx(g,{children:e.jsxs("div",{className:"text-center py-10 text-muted-foreground dark:text-dark-muted-foreground",children:[e.jsx(j,{className:"h-16 w-16 mx-auto text-primary/30 dark:text-dark-primary/30 mb-4"}),e.jsx("p",{className:"font-semibold text-lg",children:"Ready to Craft Your Presentation"}),e.jsx("p",{className:"text-sm",children:"Paste your project text above to generate an outline."})]})}),!n&&a&&e.jsxs(g,{title:`Presentation Outline: ${a.overallTitle}`,children:[e.jsxs("div",{className:"flex flex-col sm:flex-row justify-end items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4 -mt-2",children:[e.jsx(p,{onClick:T,variant:"outline",size:"sm",className:"w-full sm:w-auto",children:"Download Outline"}),e.jsx(p,{onClick:P,variant:"outline",size:"sm",className:"w-full sm:w-auto",children:"Save Outline to Google Drive"})]}),e.jsxs("div",{className:"space-y-4 max-h-[60vh] overflow-y-auto pr-2",children:[a.slides.length===0&&a.overallTitle.startsWith("Error Parsing Response")&&e.jsx("p",{className:"text-sm text-muted-foreground dark:text-dark-muted-foreground",children:"Could not generate slides due to parsing error. Raw response displayed above if available."}),a.slides.map((r,t)=>e.jsxs("div",{className:"p-4 border border-border dark:border-dark-border rounded-md bg-muted/30 dark:bg-dark-muted/30",children:[e.jsxs("h4",{className:"text-lg font-semibold text-primary dark:text-dark-primary mb-1.5",children:["Slide ",t+1,": ",r.title]}),e.jsx("ul",{className:"list-disc list-inside space-y-1 text-sm text-foreground dark:text-dark-foreground pl-4",children:r.bullets.map((s,u)=>e.jsx("li",{children:s},u))}),r.suggestedImageType&&e.jsxs("div",{className:"mt-2 pt-2 border-t border-border/30 dark:border-dark-border/30",children:[e.jsx("p",{className:"text-xs font-semibold text-muted-foreground dark:text-dark-muted-foreground",children:"Suggested Image Type:"}),e.jsx("p",{className:"text-xs text-muted-foreground dark:text-dark-muted-foreground italic",children:r.suggestedImageType})]}),r.speakerNotes&&e.jsxs("div",{className:"mt-2 pt-2 border-t border-border/30 dark:border-dark-border/30",children:[e.jsx("p",{className:"text-xs font-semibold text-muted-foreground dark:text-dark-muted-foreground",children:"Speaker Notes:"}),e.jsx("p",{className:"text-xs text-muted-foreground dark:text-dark-muted-foreground italic whitespace-pre-line",children:r.speakerNotes})]})]},t))]})]})]})]})};export{L as default};
