# 🐣 Chicken Vision - AI-Powered Egg Analysis

**A magnificently over-engineered solution to the age-old problem of... counting eggs.**

Built for the "Pointless and Over-Engineered Problems" hackathon category. Because why use a simple counter when you can deploy AI agents, blockchain, DynamoDB streams, and generative music to manage your backyard chicken coop?

## What This Actually Does

Upload a photo of eggs and get a complete AI-powered analysis:

### 🔍 **Egg Detection & Analysis**
- **Amazon Nova Pro** analyzes your image to detect individual eggs
- Each egg gets detailed physical assessment: color, shape, size, shell condition, cleanliness
- Quality grading (A/B/C) and viability scoring (0-100% hatch likelihood)
- Breed prediction based on egg characteristics

### 🐣 **Chick Visualization**
- **Amazon Nova Canvas** generates realistic images of predicted chicks
- Individual chick images for each viable egg (≥70% hatch likelihood)
- Collective "future flock" visualization showing your entire chicken family
- Breed-specific appearance details (plumage, comb type, body size)

### 🎵 **Comfort Songs** (Optional)
- Custom AI-generated comfort songs for non-viable eggs (<70% hatch likelihood)
- **ElevenLabs Music API** creates personalized melodies based on egg characteristics
- Because even eggs that won't hatch deserve emotional support

### ⛓️ **Blockchain Certification**
- **Amazon Managed Blockchain Access** records egg analysis on Polygon mainnet
- Immutable audit trail of egg authenticity and analysis results
- Real blockchain transactions with gas fees (because why not?)
- Certified eggs get verification badges in the UI

### 📊 **Real-Time Processing**
- **DynamoDB Streams** orchestrate the multi-stage AI pipeline
- Live status updates as your eggs progress through analysis
- Detailed results dashboard with expandable egg details
- Viability statistics and breed summaries

**The Problem**: You have eggs and want to know if they'll hatch.

**The Solution**: A serverless AI pipeline with more AWS services than eggs in your basket.

## Backend Architecture

### The Over-Engineering in Action

```mermaid
graph TB
    subgraph "Frontend"
        UI[React/Next.js UI]
        Upload[Image Upload Component]
        Tracker[Status Tracker Component]
        Results[Results Dashboard]
    end

    subgraph "API Layer"
        API[API Gateway]
        UploadFunc[upload-clutch Lambda]
        GetFunc[get-clutch Lambda]
        ListFunc[list-clutches Lambda]
    end

    subgraph "Storage"
        S3[S3 Bucket<br/>Images & Generated Content]
        DDB[(DynamoDB Table<br/>Clutch & Egg Data)]
    end

    subgraph "AI Detection Pipeline"
        S3Event[S3 EventBridge Event]
        Detector[egg-detector Agent<br/>Amazon Nova Pro]
        EggQueue[SQS Queue<br/>Detected Eggs]
        Analyzer[egg-analysis Agent<br/>Amazon Nova Pro]
    end

    subgraph "Stream Processing"
        Stream[DynamoDB Stream]
        StreamForwarder[analysis-forwarder Lambda]
        ViableQueue[SQS Queue<br/>Viable Eggs ≥70%]
        NonViableQueue[SQS Queue<br/>Non-Viable Eggs <70%]
    end

    subgraph "Content Generation"
        ChickGen[chick-image-generator<br/>Amazon Nova Canvas]
        SongGen[comfort-song-generator<br/>ElevenLabs Music API]
        EventBridge[EventBridge<br/>Processing Events]
        ProcessingTracker[processing-complete Lambda]
        Consolidator[gather-egg-findings Lambda]
    end

    subgraph "Blockchain Layer"
        AMB[Amazon Managed Blockchain<br/>Polygon Mainnet Access]
        BlockchainUtil[blockchain.mjs Utility]
    end

    %% User Flow
    UI --> Upload
    Upload -->|POST /clutches| UploadFunc
    UploadFunc -->|Store image| S3
    UploadFunc -->|Create clutch record| DDB
    UploadFunc -->|Return presigned URL| Upload

    %% Detection Flow
    S3 -->|Object Created Event| S3Event
    S3Event -->|Trigger| Detector
    Detector -->|Detect & analyze eggs| EggQueue
    EggQueue -->|Process each egg| Analyzer
    Analyzer -->|Save analysis| DDB

    %% Stream Processing Flow
    DDB -->|Stream changes| Stream
    Stream -->|Filter egg records| StreamForwarder
    StreamForwarder -->|Viable eggs| ViableQueue
    StreamForwarder -->|Non-viable eggs| NonViableQueue

    %% Generation Flow
    ViableQueue -->|Generate chick images| ChickGen
    NonViableQueue -->|Generate comfort songs| SongGen
    ChickGen -->|Update records| DDB
    SongGen -->|Update records| DDB
    ChickGen -->|Publish event| EventBridge
    SongGen -->|Publish event| EventBridge
    EventBridge -->|Track completion| ProcessingTracker
    ProcessingTracker -->|All complete?| Consolidator
    Consolidator -->|Generate flock image| DDB

    %% Frontend Polling
    Tracker -->|GET /clutches/{id}| GetFunc
    GetFunc -->|Query data| DDB
    GetFunc -->|Return status| Results

    %% Blockchain Integration
    UploadFunc -.->|Record upload| BlockchainUtil
    Analyzer -.->|Record analysis| BlockchainUtil
    ChickGen -.->|Record generation| BlockchainUtil
    BlockchainUtil -.->|Write to chain| AMB

    %% Styling
    style Detector fill:#ff9999
    style Analyzer fill:#ff9999
    style ChickGen fill:#99ccff
    style SongGen fill:#99ff99
    style BlockchainUtil fill:#ffcc99
    style AMB fill:#ffcc99
```

### Detailed Data Flow

#### 1. **Upload & Initial Processing**
- User uploads egg photo through React frontend
- `upload-clutch` Lambda generates S3 presigned URL
- Creates clutch metadata record in DynamoDB with status "Uploaded"
- Records blockchain transaction for upload event (optional)

#### 2. **AI-Powered Egg Detection**
- S3 EventBridge triggers `egg-detector` Lambda on image upload
- **Amazon Nova Pro** analyzes image to identify individual eggs
- For each detected egg, creates detailed physical assessment:
  - Color, shape, size, shell texture, integrity, cleanliness
  - Spots/markings, bloom condition, visible defects
  - Overall quality grade (A/B/C/non-viable)
- Sends each egg to SQS queue for individual analysis
- Updates clutch status to "Detecting Eggs"

#### 3. **Individual Egg Analysis**
- `egg-analysis` Lambda processes each egg from SQS queue
- **Amazon Nova Pro** performs deep analysis using egg characteristics
- Calculates hatch likelihood (0-100%) based on:
  - Shell integrity, hardness, bloom condition
  - Visible defects, overall grade, cleanliness
- Predicts chicken breed and appearance characteristics
- Records analysis to blockchain for certification
- Saves complete analysis to DynamoDB

#### 4. **Stream-Driven Content Generation**
- DynamoDB Streams capture all egg record updates
- `analysis-forwarder` Lambda routes eggs to appropriate queues:
  - **Viable eggs (≥70% hatch likelihood)** → Chick image generation
  - **Non-viable eggs (<70% hatch likelihood)** → Comfort song generation

#### 5. **Chick Image Generation**
- `chick-image-generator` processes viable eggs
- **Amazon Nova Canvas** creates realistic chick images based on:
  - Predicted breed characteristics
  - Plumage color, comb type, body size
  - Feather patterns and leg color
- Uploads generated images to S3 with public access
- Updates egg records with image URLs
- Records generation event to blockchain

#### 6. **Comfort Song Generation** (Optional)
- `comfort-song-generator` processes non-viable eggs
- **ElevenLabs Music API** creates personalized comfort songs
- Song characteristics based on egg color and predicted breed
- Uploads MP3 files to S3 for emotional support
- Updates egg records with song URLs

#### 7. **Processing Completion & Consolidation**
- EventBridge coordinates completion events from all generators
- `processing-complete` Lambda tracks when all eggs are processed
- `gather-egg-findings` Lambda creates final flock visualization
- **Amazon Nova Canvas** generates collective "future flock" image
- Updates clutch status to "Completed"

#### 8. **Frontend Real-Time Updates**
- React frontend polls `get-clutch` Lambda every 10 seconds
- Status tracker shows live progress through processing phases
- Animated loading states with humorous status messages
- Results dashboard displays:
  - Individual egg analysis with expandable details
  - Chick images and breed predictions
  - Viability statistics and flock overview
  - Blockchain certification badges for verified eggs

### AWS Services Used

| Service | Purpose | Why It's Overkill |
|---------|---------|-------------------|
| **Lambda** | Serverless compute | Could've been a Python script |
| **DynamoDB** | NoSQL database | Could've been a JSON file |
| **DynamoDB Streams** | Change data capture | Could've been a for-loop |
| **S3** | Image storage | Could've been local disk |
| **Bedrock (Nova Pro)** | AI analysis | Could've been "looks good" |
| **Bedrock (Nova Canvas)** | Image generation | Could've used clip art |
| **API Gateway** | HTTP API | Could've been localhost |
| **EventBridge** | Event routing | Could've been function calls |
| **AMB Access** | Blockchain | Could've been... nothing |
| **SSM Parameter Store** | Secrets management | Could've been .env |

### Key Design Decisions

**Why DynamoDB Streams?**
- Decouples egg analysis from final generation
- Allows parallel processing of multiple eggs
- Triggers consolidation only when all eggs are done
- Adds 3 more Lambda functions to the architecture diagram

**Why Multiple AI Agents?**
- Detection agent finds eggs in the image
- Analysis agent examines each egg individually
- Image generation agent creates chick visualizations
- Song generation agent writes personalized music
- Could've been one agent, but where's the fun in that?

**Why Blockchain?**
- Immutable record of egg authenticity
- NFT collectibles for hatched chicks
- Carbon-neutral virtue signaling
- Adds enterprise credibility to chicken farming
- Real Ethereum gas fees make it feel important

**Why Comfort Songs?**
- Studies show music helps egg development (citation needed)
- Each egg gets a unique song based on its characteristics
- Demonstrates creative use of generative AI
- Absolutely unnecessary, therefore perfect

## Quick Start (5 minutes)

### 1. Run Setup Script

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

The setup script will:
- ✓ Check all prerequisites (Node.js, AWS CLI, SAM CLI)
- ✓ Verify AWS credentials
- ✓ Install frontend dependencies
- ✓ Show next steps

### 2. Review Examples

- Check `examples/template.yaml` for SAM structure
- See `examples/functions/resourceTypeB/` for Node.js Lambda (`.mjs`)
- See `examples/functions/resourceTypeA/` for Python Lambda (`.py`)
- Kiro copies these automatically when generating features

### 3. Start Building with Kiro

**Spec-Driven Development (Recommended):**
```
"Create a feature called user-profile"
```

Kiro will:
1. Ask for your runtime preference (first time only)
2. Create a spec with requirements, design, and tasks
3. Automatically execute all tasks without stopping
4. Generate UI components, Lambda functions, and SAM resources
5. Update template.yaml and wire everything together

**Quick Generation (No Spec):**
```
"Create a new Lambda function called user-profile"
```

For simple additions, Kiro can generate code directly without a spec.

## Project Structure

```
.
├── .env                          # Your preferences (gitignored)
├── .env.example                  # Template for team setup
├── backend/
│   ├── template.yaml            # SAM infrastructure (shared)
│   └── functions/               # Lambda functions (one per feature)
│       ├── feature-a/           # Full-stack feature owned by person A
│       ├── feature-b/           # Full-stack feature owned by person B
│       └── ...
├── frontend/                     # React application
│   └── src/
│       ├── app/                 # Next.js pages
│       └── components/          # React components
└── examples/                     # Kiro copies these when generating
    ├── template.yaml
    └── functions/
        ├── resourceTypeB/       # Node.js example (.mjs)
        └── resourceTypeA/       # Python example (.py)
```

## Team Workflow

### Each Person Owns a Full-Stack Feature
- React component(s) for UI
- Lambda function(s) for backend
- SAM resources in shared template.yaml
- End-to-end responsibility

### Coordination
- One person designated as deployer
- Everyone adds to shared `template.yaml`
- Communicate API contracts in shared doc
- Merge conflicts? Last person wins (it's a hackathon!)

## Deployment

**From project root:**

Mac/Linux:
```bash
npm run deploy
```

Windows:
```bash
npm run deploy:windows
```

**Or directly from backend folder:**

Mac/Linux:
```bash
cd backend
npm run deploy
```

Windows:
```bash
cd backend
npm run deploy:windows
```

The deploy script will:
1. Install backend dependencies
2. Build the SAM application
3. Deploy to AWS (guided setup on first run)
4. Get the API URL from stack outputs
5. Automatically configure `frontend/.env.local`

**First time deployment:**
```bash
cd backend
npm run deploy:guided
```

## Supported Runtimes

- **Node.js 22.x** - Use `.mjs` files with ES modules
- **Python 3.13** - Use `.py` files with boto3

Set your preference in `.env` and Kiro will use it automatically.

## Time Checkpoints

- **Hour 1**: Base template deployed, features assigned
- **Hour 2**: Each person has working Lambda + UI
- **Hour 3**: Features complete and integrated
- **Hour 4**: Polish and AWS service showcase
- **Hour 5**: Demo prep and practice

## Kiro Integration

### Spec-Driven Workflow
Kiro uses specs to build complex features systematically:
1. **Requirements** - What the feature should do
2. **Design** - How it will work (architecture, data models, APIs)
3. **Tasks** - Step-by-step implementation plan
4. **Execution** - Kiro executes all tasks automatically

Just say "Create a feature called X" and Kiro handles the entire flow.

### Document for Judges
- Take screenshots of Kiro conversations
- Note time saved on code generation
- Highlight debugging assistance
- Show AWS service recommendations
- Demonstrate spec-driven development

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **AWS CLI** - [Install Guide](https://aws.amazon.com/cli/)
- **AWS SAM CLI** - [Install Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- **Python 3.9+** (optional, only if using Python Lambdas) - [Download](https://www.python.org/)
- **AWS Account** with configured credentials (`aws configure`)

Run the setup script to verify all prerequisites are installed.

## The Magnificent Over-Engineering

### What Makes This Gloriously Unnecessary

**Problem**: Count eggs and guess if they'll hatch
**Normal Solution**: Look at them, maybe use a flashlight
**Our Solution**: Deploy 15+ AWS services and write to Ethereum mainnet

### Features That Shouldn't Exist

1. **AI-Powered Egg Detection**
   - Uses Amazon Nova Pro to identify eggs in photos
   - Could've just asked "how many eggs do you have?"
   - But where's the machine learning in that?

2. **Breed Prediction from Shell Color**
   - Analyzes egg characteristics to predict chicken breed
   - Generates detailed appearance descriptions
   - Creates custom images of predicted chicks
   - Could've Googled "brown egg chicken breeds"

3. **Personalized Comfort Songs**
   - Each egg gets a unique song based on its characteristics
   - Generated by AI analyzing shell texture and color
   - Includes lyrics about the egg's journey to hatching
   - Studies show this helps exactly 0% more than silence

4. **Blockchain Verification**
   - Every egg recorded on Ethereum mainnet
   - Real gas fees for immutable egg authenticity
   - NFT minting for hatched chicks with rarity scores
   - Because your backyard chickens deserve Web3

5. **DynamoDB Streams Orchestration**
   - Stream processing to coordinate AI agents
   - Event-driven architecture for egg analysis
   - Could've been a for-loop
   - But this way we get to draw a better architecture diagram

### Amazon Managed Blockchain (AMB) Access Integration 🌐

**Real Ethereum blockchain integration** for enterprise-grade poultry management!

#### Setup AMB Access
```bash
./setup-amb-access.sh
```

This configures:
- SSM parameter for AMB access token
- Ethereum mainnet connection via AWS
- Smart contract deployment utilities
- Carbon footprint tracking (because we care)

#### Blockchain Features
- ✅ Immutable egg authenticity records
- ✅ NFT minting for hatched chicks
- ✅ Smart contracts for ownership tracking
- ✅ Real gas fees (adds gravitas to egg rotation)
- ✅ SHA-512 encryption for incubation data
- ✅ Carbon neutral virtue signaling

Perfect for the "Magnificent Impracticability" category!

## Need Help?

Check `.kiro/steering/hackathon-speed-rules.md` for detailed guidelines.
