# CJ ONLYONE FAIR  
## Learning Through Trial & Growth Platform  
(Web Application Instruction for Vibe Coding)

---

## 0. Document Purpose

This document is a **single source of truth** for designing and building the  
CJ ONLYONE FAIR web application.

It aligns:
- Educational philosophy
- UX language framing
- Technical edge-case handling
- Event operations
- Post-event learning analytics

The goal is NOT to build an event utility app,  
but to build a **learning system that embodies CJ’s people philosophy through experience**.

---

## 1. Core Philosophy

### 1.1 Reframing "Failure" as "Learning"

❌ Failure as exposure  
❌ Failure as evaluation  

✅ Trial & error as learning  
✅ Growth as a visible process  

**Key principle:**  
> We do not ask users to “reveal failure.”  
> We invite them to **share learning in progress**.

---

## 2. Language & UX Framing (Critical)

### 2.1 Mandatory UI Language Mapping

| Old Term (DO NOT USE) | New Term (USE THIS) |
|---|---|
| 실패 기록하기 | 배운 점 남기기 / 시행착오 공유 |
| 실패 태그 | 성장 키워드 |
| 실패 사례 | 과정 중 배움 |
| 응원하기 | 응원하기 + 나도 비슷했어요 |

> The word “실패 (failure)” must be minimized in user-facing UI.

---

### 2.2 Growth Keywords (Tags)

- 기획 (Planning)
- 협업 (Collaboration)
- 의사결정 (Decision-making)
- 실행 (Execution)
- 커뮤니케이션 (Communication)

These are **learning lenses**, not evaluation categories.

---

### 2.3 Onboarding (First App Launch – Mandatory)

3-slide storytelling onboarding (no skip before slide 2):

1.  
> “Every successful business started with dozens of wrong assumptions.”

2.  
> “CJ’s hit products were once experiments that didn’t work.”

3.  
> “Today’s trial and error becomes tomorrow’s insight.”

**Explicit message:**  
> “You are not sharing failure.  
> You are sharing your learning journey.”

---

## 3. User Roles

### 3.1 Participants
- New employees visiting booths
- Recording learning moments
- Supporting peers

### 3.2 Booth Operators
- Present business ideas
- Share trial & error stories
- Engage in discussion

### 3.3 Operators / Educators
- Monitor flow & engagement
- Analyze learning outcomes post-event

---

## 4. Core Features (Functional Specification)

### 4.1 Learning Record (Formerly Failure Record)

**Function**
- Users submit short learning reflections during the event.

**Requirements**
- Short-text input only (low psychological barrier)
- Mandatory growth keyword selection
- Optional emotion reaction only (no text comments in MVP)

---

### 4.2 Peer Resonance Buttons

Buttons:
- 👍 응원해요 (Support)
- 🤝 나도 비슷했어요 (Shared Experience)

Purpose:
- Reduce isolation
- Reinforce psychological safety
- Build peer-level learning solidarity

---

### 4.3 Booth Exploration & Check-in

#### Primary
- QR / NFC-based automatic check-in

#### Fallback (Mandatory)
- Manual booth code input (4-digit, e.g. A101)
- Copy text:
  > “QR이 잘 안 되나요? 부스 코드를 입력해 주세요.”

Check-in success triggers:
- Booth learning keywords
- Core trial & error summary

---

### 4.4 Crowd Load Balancing

**Display**
- 🟢 Low
- 🟡 Medium
- 🔴 High

**Rules**
- No forced routing
- Recommendation only

Copy examples:
- “지금 이 부스는 비교적 여유 있어요”
- “당신이 공감한 키워드와 유사한 부스입니다”

---

### 4.5 Booth Detail Page (Learning-first Structure)

Mandatory order:

1. Idea summary (1 line)
2. Initial wrong assumption
3. Trial & conflict moments
4. Learning & pivot
5. Current state (result)

⚠️ Results must never lead the story.

---

### 4.6 “Write & Release” Learning Wall (Online–Offline)

**Recommended Implementation**
- App-triggered erase action
- Real-time sync via WebSocket
- Large display visualizes learning notes
- App action → screen update

Meaning of “erase”:
❌ Deleting failure  
✅ Marking learning as processed

---

## 5. Technical Requirements

### 5.1 Traffic & Stability

- Design target: **500 concurrent users**
- Include:
  - Participants
  - Operators
  - Mentors
  - Test traffic

### 5.2 Load Testing (Mandatory)
- Tools: k6 or Apache JMeter
- Stress test before event day

### 5.3 Real-time Communication
- WebSocket for:
  - Crowd status
  - Learning wall sync

---

## 6. Post-Event Learning Value (Most Important)

### 6.1 Personal Growth Report (Auto-generated)

Delivered after event:

- Most resonated growth keyword
- Booth patterns visited
- Peer support received

Example copy:
> “당신은 협업 관련 배움에 가장 많이 공감했어요.”  
> “당신의 솔직한 기록이 12명에게 힘이 되었습니다.”

---

### 6.2 Education Team Analytics

Provide insights such as:
- Booth dwell time vs resonance mismatch
- Top learning keywords (organization-wide)
- Under-engaged booth patterns

Purpose:
- Improve future OnlyOne Fair design
- Support CJ talent development strategy

---

### 6.3 3-Day Reflection Reminder (Optional Push)

Example:
> “그날 기록했던 ‘협업의 시행착오’, 지금은 어떻게 달라졌나요?”

---

## 7. MVP Development Phases

### Phase 1 – MVP (Must-have)
- Booth list + check-in
- Learning record + growth keywords
- Resonance buttons (emoji only)
- Crowd status (3 levels)

### Phase 2 – Event-ready
- Personalized route recommendation
- Booth learning story pages
- Online–offline learning wall

### Phase 3 – Post-event
- Growth report
- Advanced dashboard
- Reflection reminder

---

## 8. Pre-launch Checklist

- [ ] UI language avoids “failure” framing
- [ ] Design reinterprets Toss-style UX with CJ tone
- [ ] WebSocket feasibility confirmed
- [ ] QR codes & Wi-Fi tested on-site
- [ ] KPI & survey questions predefined

---

## Final Principle

This is not an event app.  
This is a **learning infrastructure**.

If built correctly,  
participants won’t remember “using an app” —  
they’ll remember **how their thinking changed**.