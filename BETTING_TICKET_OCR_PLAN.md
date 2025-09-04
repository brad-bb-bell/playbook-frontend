# Betting Ticket OCR Implementation Plan

## Overview
Add a feature to upload betting ticket screenshots that will be processed by an LLM with vision capabilities to automatically extract and fill in bet details.

## Architecture

### Frontend (Vue.js - This Repository)
- Image upload component in new bet modal
- Preview uploaded image before processing  
- Show loading state during LLM processing
- Auto-populate form fields with extracted data
- Error handling for failed extractions

### Backend (Node/Express - Separate Repository)
- New endpoint: `POST /api/parse-ticket`
- Handle multipart/form-data image uploads
- Integrate with LLM vision API (OpenAI GPT-4 Vision or Anthropic Claude)
- Return structured JSON with extracted bet details

## API Contract

### Request
```
POST /api/parse-ticket
Content-Type: multipart/form-data

Body:
- image: File (png, jpg, jpeg)
- sport: String (optional hint: "NFL", "NBA")
```

### Response
```json
{
  "success": true,
  "data": {
    "sport": "NFL",
    "season": "2025",
    "betType": "spread",
    "week": "1",
    "team": "Kansas City Chiefs",
    "opponent": "Detroit Lions", 
    "line": "-3.5",
    "odds": "-110",
    "betAmount": "100",
    "notes": "Thursday Night Football"
  },
  "confidence": {
    "overall": 0.95,
    "fields": {
      "team": 0.98,
      "opponent": 0.97,
      "line": 0.99,
      "betAmount": 1.0
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "PARSE_FAILED",
    "message": "Unable to extract bet details from image",
    "details": "Image quality too low or ticket format not recognized"
  }
}
```

## Implementation Steps

### Phase 1: Frontend UI (This Repository)
1. Add image upload button to new bet modal
2. Implement image preview component
3. Add loading spinner/skeleton during processing
4. Create service function to call backend API
5. Map response data to form fields
6. Add confidence indicators for extracted fields

### Phase 2: Backend API (Express Repository)
1. Create `/api/parse-ticket` endpoint
2. Set up multer for image upload handling
3. Integrate OpenAI or Anthropic SDK
4. Implement image preprocessing (resize, compress if needed)
5. Create prompt template for consistent extraction
6. Add response validation and error handling

### Phase 3: LLM Integration
1. Design robust prompt for ticket parsing
2. Handle multiple betting site formats
3. Implement fallback for low-confidence extractions
4. Add caching to avoid re-processing identical images

## LLM Prompt Template

```
Analyze this betting ticket image and extract the following information:

1. Sport (NFL, NBA, MLB, etc.)
2. Bet Type (spread, moneyline, over/under, parlay, teaser)
3. Team being bet on
4. Opponent team
5. Point spread or line (if applicable)
6. Odds (e.g., -110, +150)
7. Bet amount in dollars
8. Game week or date
9. Any additional notes (game time, special conditions)

Return ONLY valid JSON in this exact format:
{
  "sport": "",
  "betType": "", 
  "team": "",
  "opponent": "",
  "line": "",
  "odds": "",
  "betAmount": "",
  "week": "",
  "notes": ""
}

If you cannot determine a field with confidence, use null.
```

## Technical Considerations

### Performance
- Compress images before sending to API (max 1MB)
- Implement request timeout (30 seconds)
- Cache parsed results by image hash

### Security
- Validate image file types
- Sanitize extracted text before display
- Rate limit API calls per user
- Strip EXIF data from uploaded images

### Cost Management
- GPT-4 Vision: ~$0.01-0.03 per image
- Anthropic Claude: Similar pricing
- Consider daily/monthly limits per user
- Implement cost tracking and alerts

### Error Handling
- Network failures
- API rate limits
- Unsupported ticket formats
- Low quality/blurry images
- Partial data extraction

## Frontend Code Structure

```javascript
// src/services/ticketParser.js
export async function parseTicketImage(imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile)
  
  const response = await axios.post(
    `${API_BASE_URL}/api/parse-ticket`,
    formData,
    { 
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000 
    }
  )
  
  return response.data
}

// src/components/TicketUpload.vue
// Component for handling image upload and preview

// src/composables/useTicketParser.js  
// Composable for managing parsing state and form population
```

## Backend Integration Points

### Required Environment Variables
```
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

MAX_IMAGE_SIZE=1048576  # 1MB in bytes
RATE_LIMIT_PER_HOUR=20
```

### Dependencies to Install
```json
{
  "dependencies": {
    "multer": "^1.4.5",
    "openai": "^4.0.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "sharp": "^0.33.0"  // for image preprocessing
  }
}
```

## Testing Strategy

### Test Cases
1. Clear, well-lit ticket images
2. Multiple betting site formats (DraftKings, FanDuel, BetMGM, etc.)
3. Different bet types (straight, parlay, teaser)
4. Partial/cropped tickets
5. Low quality/blurry images
6. Non-ticket images (should fail gracefully)

### Sample Test Tickets
- Collect anonymized samples from different platforms
- Create mock tickets for edge cases
- Test with various image formats and sizes

## Future Enhancements

1. **Batch Processing**: Upload multiple tickets at once
2. **Historical Import**: Process past tickets for record import
3. **Receipt Storage**: Save original ticket images with bets
4. **Smart Corrections**: Learn from user corrections to improve accuracy
5. **Platform Detection**: Auto-detect betting platform for better parsing
6. **OCR Fallback**: Use traditional OCR if LLM fails

## Success Metrics

- Extraction accuracy > 90% for standard tickets
- Processing time < 5 seconds per image
- User adoption rate > 50% of new bet entries
- Error rate < 10% for supported formats

## Timeline Estimate

- Phase 1 (Frontend): 1 day
- Phase 2 (Backend): 1 day  
- Phase 3 (LLM Integration): 1 day
- Testing & Refinement: 1-2 days

**Total: 4-5 days of development**