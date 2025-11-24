# Hackathon Starter Kit

The purple teams's 5-hour hackathon template optimized for speed with Kiro AI assistance.

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

## Need Help?

Check `.kiro/steering/hackathon-speed-rules.md` for detailed guidelines.
