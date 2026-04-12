import React from 'react'
import { useState } from 'react';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import './Notes.css'
function Notes({onClose}) {
        const [notes, setNotes] = useState(() => {
 return localStorage.getItem("notes") || "";
});
 const handleclear = () => {
        setNotes("");
        localStorage.removeItem("notes");
    }
    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([notes], { type: "text/plain" }); 
        element.href = URL.createObjectURL(file);
        element.download = "notes.txt";
        document.body.appendChild(element); 
        element.click();
    }

  return (
    <div className='Notespanel'>
           <div className='notesheader'>
           
            <h2> <TextSnippetIcon />  Private Notes</h2>
   <button className='closeicon' onClick={onClose} style={{backgroundColor:"transparent"}}>
<CloseIcon /> 
</button>       
           </div>
           <div className='notesbody'>
            <textarea  value={notes} onChange={(e) => setNotes(e.target.value)} >
            
            </textarea>
           </div>
           <div className='Notesfooter'>
              <button onClick={handleDownload}> <DownloadIcon /> Download</button>
            <button onClick={handleclear}> <DeleteIcon /> Clear</button>
              
           </div>
    </div>
  )
}

export default Notes