import React, { useState } from 'react'
import { Gift, Heart } from 'lucide-react'

export default function GiftRevealScene({ gift, onDone }) {
  const [hits, setHits] = useState(0)
  const [broken, setBroken] = useState(false)
  const [axeSwing, setAxeSwing] = useState(false)

  function hitCrate() {
    if (broken || axeSwing) return

    setAxeSwing(true)

    const nextHits = hits + 1
    setHits(nextHits)

    setTimeout(() => setAxeSwing(false), 420)

    if (nextHits >= 3) {
      setTimeout(() => setBroken(true), 380)
    }
  }

  const crateShake =
    hits === 1
      ? 'reveal-crate shake-small'
      : hits === 2
        ? 'reveal-crate shake-medium'
        : 'reveal-crate'

  return (
    <div className="reveal-scene">
      <style>{`
        .reveal-scene {
          position: fixed;
          inset: 0;
          z-index: 50;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 18%, #24462c 0%, #0b1a10 55%, #050d08 100%);
          display: grid;
          place-items: center;
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #f2fff5;
          animation: revealSceneIn .7s ease both;
        }

        .reveal-tree {
          position: absolute;
          left: 50%;
          bottom: -8%;
          transform: translateX(-50%);
          width: min(92vw, 560px);
          height: 88%;
          pointer-events: none;
        }

        .reveal-trunk {
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: 130px;
          height: 78%;
          border-radius: 40px 40px 12px 12px;
          background:
            linear-gradient(90deg, #2c1d12, #4a3120 35%, #5d3f28 55%, #33221a);
          box-shadow: 0 0 80px rgba(0,0,0,.55);
        }

        .reveal-branch {
          position: absolute;
          background: linear-gradient(90deg, #3a2718, #543a25);
          border-radius: 20px;
        }

        .reveal-branch.one {
          width: 210px;
          height: 24px;
          left: -60px;
          top: 22%;
          transform: rotate(-16deg);
        }

        .reveal-branch.two {
          width: 230px;
          height: 22px;
          right: -70px;
          top: 34%;
          transform: rotate(14deg);
        }

        .reveal-branch.three {
          width: 170px;
          height: 18px;
          left: -35px;
          top: 52%;
          transform: rotate(-24deg);
        }

        .reveal-leaves {
          position: absolute;
          width: 260px;
          height: 190px;
          border-radius: 50%;
          background: radial-gradient(circle, #2f6b3a 0%, #173620 65%, transparent 72%);
          filter: blur(8px);
          opacity: .85;
        }

        .reveal-leaves.one { left: -95px; top: 8%; }
        .reveal-leaves.two { right: -105px; top: 20%; }
        .reveal-leaves.three { left: -60px; top: 42%; }
        .reveal-leaves.four { right: -70px; top: 58%; }

        .reveal-vine {
          position: absolute;
          left: 50%;
          top: 0;
          width: 7px;
          height: 34%;
          margin-left: -3.5px;
          background: linear-gradient(180deg, #3f7a35, #2b5424);
          border-radius: 8px;
          transform-origin: top center;
          animation: vineSway 4.5s ease-in-out infinite;
        }

        .reveal-crate-wrap {
          position: absolute;
          left: 50%;
          top: 33%;
          transform: translateX(-50%);
          transform-origin: top center;
        }

        .reveal-crate {
          position: relative;
          width: 170px;
          height: 150px;
          border-radius: 8px;
          background:
            linear-gradient(180deg, #8a5a33, #6b4324 55%, #503018);
          box-shadow:
            inset 0 0 0 5px #4a2d16,
            inset 0 0 30px rgba(0,0,0,.45),
            0 25px 45px rgba(0,0,0,.55);
          cursor: pointer;
          user-select: none;
        }

        .reveal-crate:before,
        .reveal-crate:after {
          content: "";
          position: absolute;
          left: -8px;
          right: -8px;
          height: 15px;
          background: #6d4526;
          border-radius: 4px;
          box-shadow: inset 0 0 0 2px #4a2d16;
        }

        .reveal-crate:before { top: 22px; }
        .reveal-crate:after { bottom: 22px; }

        .reveal-nail {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d8d3c8;
          box-shadow: 0 1px 2px rgba(0,0,0,.6);
        }

        .reveal-crack {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity .25s;
        }

        .reveal-crack.visible { opacity: 1; }

        .reveal-crack span {
          position: absolute;
          background: #241206;
          border-radius: 4px;
        }

        .shake-small { animation: crateShakeSmall .35s ease; }
        .shake-medium { animation: crateShakeMedium .38s ease; }

        .reveal-crate.broken {
          animation: crateBreak .75s ease forwards;
          pointer-events: none;
        }

        .reveal-axe {
          position: absolute;
          right: -78px;
          top: 18px;
          font-size: 64px;
          transform-origin: bottom left;
          transform: rotate(-55deg);
          transition: transform .18s cubic-bezier(.2,.8,.2,1);
          filter: drop-shadow(0 10px 14px rgba(0,0,0,.45));
        }

        .reveal-axe.swing {
          transform: rotate(35deg) translate(-24px, 8px);
        }

        .reveal-hint {
          position: absolute;
          left: 50%;
          bottom: 36px;
          transform: translateX(-50%);
          width: min(92vw, 430px);
          padding: 14px 18px;
          text-align: center;
          border-radius: 18px;
          background: rgba(6, 18, 11, .74);
          border: 1px solid rgba(255,255,255,.13);
          backdrop-filter: blur(12px);
          font-size: 13px;
          line-height: 1.5;
        }

        .reveal-gift {
          position: relative;
          z-index: 3;
          width: min(92vw, 430px);
          padding: 28px 20px 22px;
          text-align: center;
          border-radius: 24px;
          background: linear-gradient(180deg, #fff8fa, #fff);
          color: #33262b;
          border: 1px solid #f3d3dd;
          box-shadow: 0 30px 80px rgba(0,0,0,.5);
          animation: giftPop .7s cubic-bezier(.2,.8,.2,1) both;
        }

        .reveal-gift:before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 5px;
          border-radius: 24px 24px 0 0;
          background: linear-gradient(90deg, #f8c5d2, #e85d83, #f7d9a7);
        }

        .reveal-gift-flower {
          font-size: 76px;
          margin: 10px 0 12px;
          animation: giftFlowerIn .8s cubic-bezier(.2,.8,.2,1) both;
        }

        .reveal-gift h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 24px;
          margin: 8px 0;
          color: #38272e;
        }

        .reveal-gift-message {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 17px;
          line-height: 1.55;
          color: #684a55;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          margin: 14px 0;
        }

        .reveal-gift-from {
          font-size: 11px;
          color: #a18a92;
        }

        .reveal-gift-from strong { color: #694653; }

        .reveal-open-button {
          width: 100%;
          margin-top: 18px;
          border: 0;
          border-radius: 14px;
          padding: 14px;
          background: linear-gradient(135deg, #ed7294, #d94c78);
          color: #fff;
          font-weight: 800;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
        }

        .reveal-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
        }

        .reveal-particle {
          position: absolute;
          left: 50%;
          top: 42%;
          font-size: 18px;
          opacity: 0;
          animation: particleBurst 1.1s ease-out forwards;
        }

        @keyframes revealSceneIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes vineSway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }

        @keyframes crateShakeSmall {
          0%, 100% { transform: rotate(0); }
          25% { transform: rotate(-3deg); }
          60% { transform: rotate(2.5deg); }
        }

        @keyframes crateShakeMedium {
          0%, 100% { transform: rotate(0); }
          20% { transform: rotate(-5deg); }
          45% { transform: rotate(4deg); }
          75% { transform: rotate(-2deg); }
        }

        @keyframes crateBreak {
          0% { transform: scale(1); opacity: 1; }
          35% { transform: scale(1.08) rotate(-3deg); }
          100% { transform: scale(.4) rotate(18deg) translateY(140px); opacity: 0; }
        }

        @keyframes giftPop {
          0% { opacity: 0; transform: scale(.75) translateY(30px); }
          70% { opacity: 1; transform: scale(1.04) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes giftFlowerIn {
          0% { opacity: 0; transform: scale(.4) rotate(-20deg); }
          70% { opacity: 1; transform: scale(1.12) rotate(5deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }

        @keyframes particleBurst {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(.4); }
          25% { opacity: 1; }
          100% {
            opacity: 0;
            transform: translate(
              calc(-50% + var(--dx)),
              calc(-50% + var(--dy))
            ) scale(1.1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal-scene *, .reveal-scene *::before, .reveal-scene *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      {!broken && (
        <>
          <div className="reveal-tree">
            <div className="reveal-leaves one" />
            <div className="reveal-leaves two" />
            <div className="reveal-leaves three" />
            <div className="reveal-leaves four" />

            <div className="reveal-trunk">
              <div className="reveal-branch one" />
              <div className="reveal-branch two" />
              <div className="reveal-branch three" />
            </div>
          </div>

          <div className="reveal-vine" />

          <div className="reveal-crate-wrap">
            <div
              className={`${crateShake} ${broken ? 'broken' : ''}`}
              onClick={hitCrate}
              role="button"
              tabIndex={0}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  hitCrate()
                }
              }}
              aria-label="Разбей деревянный ящик"
            >
              <span className="reveal-nail" style={{ left: '12px', top: '12px' }} />
              <span className="reveal-nail" style={{ right: '12px', top: '12px' }} />
              <span className="reveal-nail" style={{ left: '12px', bottom: '12px' }} />
              <span className="reveal-nail" style={{ right: '12px', bottom: '12px' }} />

              <div className={`reveal-crack ${hits >= 1 ? 'visible' : ''}`}>
                <span style={{ left: '38%', top: '18%', width: '4px', height: '48px', transform: 'rotate(18deg)' }} />
              </div>

              <div className={`reveal-crack ${hits >= 2 ? 'visible' : ''}`}>
                <span style={{ left: '56%', top: '30%', width: '4px', height: '62px', transform: 'rotate(-22deg)' }} />
                <span style={{ left: '22%', top: '48%', width: '42px', height: '4px', transform: 'rotate(10deg)' }} />
              </div>

              <div className={`reveal-axe ${axeSwing ? 'swing' : ''}`}>
                🪓
              </div>
            </div>
          </div>

          <div className="reveal-hint">
            {hits === 0 && 'На дереве висит твой подарок. Нажми на ящик, чтобы разбить его.'}
            {hits === 1 && 'Один удар. Ящик треснул — продолжай!'}
            {hits === 2 && 'Ещё один удар, и ты увидишь подарок!'}
          </div>
        </>
      )}

      {broken && (
        <>
          <div className="reveal-particles">
            {['✦','✧','✦','❀','✧','✦','❀','✧'].map((symbol, index) => (
              <span
                key={index}
                className="reveal-particle"
                style={{
                  '--dx': `${(index - 3.5) * 46}px`,
                  '--dy': `${-70 - (index % 4) * 34}px`,
                  animationDelay: `${index * 0.045}s`,
                }}
              >
                {symbol}
              </span>
            ))}
          </div>

          <div className="reveal-gift">
            <div className="reveal-gift-flower">
              {gift.flower_emoji || '💐'}
            </div>

            <div className="eyebrow">ЭТО ДЛЯ ТЕБЯ</div>
            <h2>{gift.flower_name}</h2>

            <p className="reveal-gift-message">
              {gift.message}
            </p>

            <p className="reveal-gift-from">
              С теплом, от <strong>{gift.sender}</strong>
            </p>

            <button
              type="button"
              className="reveal-open-button"
              onClick={onDone}
            >
              <Gift size={17} />
              Забрать подарок
            </button>

            <div
              style={{
                marginTop: '14px',
                color: '#e87896',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Heart size={18} fill="currentColor" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
