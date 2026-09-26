/** Product welcome messages do not require a paid model call. */
export function welcomeReply(message:string):string|null {
 const text=message.trim().toLowerCase().replace(/[!.?,👋\s]+$/gu,'');
 if(/^(hi+|hey+|hello+|hello there|good (morning|afternoon|evening)|greetings|namaste|vanakkam|வணக்கம்|नमस्ते)$/.test(text))return 'Hey! What would you like to learn today? Tell me a topic, or bring a file, recording, or YouTube link. We can turn it into clear notes, practice questions, and flashcards.';
 if(/^(thanks|thank you|thankyou|thanks a lot|thank you so much)$/.test(text))return 'You’re welcome! Ready to explore another idea, or practise what you’ve learned?';
 return null;
}
