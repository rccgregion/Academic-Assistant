export const downloadTextFile = (content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href); // Clean up
};

export const downloadDataUri = (dataUri: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // No URL.revokeObjectURL needed for data URIs of this type as the browser handles it
};
