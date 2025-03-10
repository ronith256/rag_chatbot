import logging
import os
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer

class DocumentProcessor:
    def __init__(self, embedding_model='all-MiniLM-L6-v2'):
        """
        Initialize the DocumentProcessor with a specified embedding model.
        
        Args:
            embedding_model (str): Name of the sentence transformer model to use for embeddings
        """
        self.embedder = SentenceTransformer(embedding_model)
        self.document_text = ""
        self.sections = []
        self.section_embeddings = None
        
    def load_document(self, document_path):
        """
        Load a document from a file (PDF or TXT)
        
        Args:
            document_path (str): Path to the document file
            
        Returns:
            str: The extracted text from the document
        """
        _, file_extension = os.path.splitext(document_path)
        
        try:
            if file_extension.lower() == '.pdf':
                self.document_text = self._extract_text_from_pdf(document_path)
            else:  # Assume text file
                with open(document_path, 'r', encoding='utf-8') as file:
                    self.document_text = file.read()
                    
            logging.info(f"Successfully loaded document: {document_path}")
            return self.document_text
        except Exception as e:
            logging.error(f"Error loading document {document_path}: {str(e)}")
            raise
            
    def _extract_text_from_pdf(self, pdf_path):
        """
        Extract text from a PDF file
        
        Args:
            pdf_path (str): Path to the PDF file
            
        Returns:
            str: The extracted text from the PDF
        """
        text = ""
        try:
            reader = PdfReader(pdf_path)
            for page in reader.pages:
                text += page.extract_text() + "\n\n"
            return text
        except Exception as e:
            logging.error(f"Error extracting text from PDF {pdf_path}: {str(e)}")
            raise
            
    def split_into_sections(self, delimiter='\n\n'):
        """
        Split the document text into sections based on the delimiter
        
        Args:
            delimiter (str): The delimiter to use for splitting
            
        Returns:
            list: The sections of the document
        """
        if not self.document_text:
            logging.warning("No document loaded. Please load a document first.")
            return []
            
        self.sections = [s.strip() for s in self.document_text.split(delimiter) if s.strip()]
        logging.info(f"Document split into {len(self.sections)} sections")
        return self.sections
        
    def compute_embeddings(self):
        """
        Compute embeddings for all sections
        
        Returns:
            tensor: The embeddings of the sections
        """
        if not self.sections:
            logging.warning("No sections available. Please split the document first.")
            return None
            
        try:
            self.section_embeddings = self.embedder.encode(self.sections, convert_to_tensor=True)
            logging.info(f"Computed embeddings for {len(self.sections)} sections")
            return self.section_embeddings
        except Exception as e:
            logging.error(f"Error computing embeddings: {str(e)}")
            raise