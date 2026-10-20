
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import {
  Copy,
  Gift,
  Heart,
  Sparkles,
  Flower2,
  ArrowLeft,
  Check,
  Sun,
} from 'lucide-react'
import Rose3D from './Rose3D.jsx'
import './styles.css'

const FLOWERS = [
  {
    id: 'bouquet',
    name: 'Нежный букет',
    short: 'Нежный',
    sub: 'букет',
    emoji: '💐',
  },
  {
    id: 'roses',
    name: 'Красные розы',
    short: 'Красные',
    sub: 'розы',
    emoji: '🌹',
  },
  {
    id: 'tulips',
    name: 'Тюльпаны',
    short: 'Тюльпаны',
    sub: 'весенние',
    emoji: '🌷',
  },
  {
    id: 'sunflowers',
    name: 'Подсолнухи',
    short: 'Подсолнухи',
    sub: 'солнечные',
    emoji: '🌻',
  },
  {
    id: 'lavender',
    name: 'Лаванда',
    short: 'Лаванда',
    sub: 'спокойствие',
    emoji: '🪻',
  },
  {
    id: 'sakura',
    name: 'Сакура',
    short: 'Сакура',
    sub: 'нежность',
    emoji: '🌸',
  },
]

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

const STORAGE_KEY = 'flowers-by-code-v2'

function localGifts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint8Array(6)

  crypto.getRandomValues(bytes)

  return [...bytes]
    .map(n => alphabet[n % alphabet.length])
    .join('')
}

function App() {
  const [tab, setTab] = useState('make')
  const [flowerId, setFlowerId] = useState('bouquet')
  const [sender, setSender] = useState('')
  const [message, setMessage] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [gift, setGift] = useState(null)
  const [createdCode, setCreatedCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const flower =
    FLOWERS.find(f => f.id === flowerId) || FLOWERS[0]

  const isCloud = Boolean(supabase)

  useEffect(() => {
    if (createdCode) {
      document
        .getElementById('created-card')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
    }
  }, [createdCode])

  const setMode = mode => {
    setTab(mode)
    setError('')
    setGift(null)
    setCreatedCode('')
    setCopied(false)
  }

  async function createGift(e) {
    e.preventDefault()

    setBusy(true)
    setError('')
    setCreatedCode('')
    setGift(null)

    try {
      const cleanSender =
        sender.trim() || 'Тайный поклонник'

      const cleanMessage =
        message.trim() || 'Просто хочу, чтобы ты улыбнулась ❤️'

      let code = ''
      let saved = false

      for (let attempt = 0; attempt < 4 && !saved; attempt++) {
        code = makeCode()

        const item = {
          code,
          flower_id: flower.id,
          flower_name: flower.name,
          flower_emoji: flower.emoji,
          sender: cleanSender,
          message: cleanMessage,
        }

        if (supabase) {
          const { error: insertError } = await supabase
            .from('gifts')
            .insert(item)

          if (!insertError) {
            saved = true
          } else if (
            !/duplicate|unique/i.test(insertError.message || '')
          ) {
            throw insertError
          }
        } else {
          const all = localGifts()

          if (!all[code]) {
            all[code] = {
              ...item,
              created_at: new Date().toISOString(),
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
            saved = true
          }
        }
      }

      if (!saved) {
        throw new Error('Не удалось подобрать код. Попробуй ещё раз.')
      }

      setCreatedCode(code)
    } catch (err) {
      setError(
        isCloud
          ? `Не получилось сохранить подарок: ${
              err.message || 'проверь настройки Supabase'
            }`
          : 'Не удалось сохранить подарок в браузере. Проверь, что локальное хранилище доступно.'
      )
    } finally {
      setBusy(false)
    }
  }

  async function redeemGift(e) {
    e.preventDefault()

    setBusy(true)
    setError('')
    setGift(null)

    const code = codeInput
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')

    if (code.length !== 6) {
      setError('Код должен состоять из 6 символов.')
      setBusy(false)
      return
    }

    try {
      let found

      if (supabase) {
        const { data, error: readError } = await supabase
          .rpc('get_gift_by_code', {
            p_code: code,
          })
          .maybeSingle()

        if (readError) throw readError

        found = data
      } else {
        found = localGifts()[code]
      }

      if (!found) {
        setError(
          'Такого подарка не нашли. Проверь код и попробуй ещё раз.'
        )
        return
      }

      setGift(found)
    } catch (err) {
      setError(
        isCloud
          ? `Не получилось получить подарок: ${
              err.message || 'ошибка соединения'
            }`
          : 'Не удалось проверить подарок. Попробуй ещё раз.'
      )
    } finally {
      setBusy(false)
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(createdCode)
      setCopied(true)
    } catch {
      setError(
        `Не получилось скопировать автоматически. Код: ${createdCode}`
      )
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={e => {
            e.preventDefault()
            setMode('make')
          }}
        >
          <span className="brand-icon">🌷</span>
          <span>ЦВЕТЫ ПО КОДУ</span>
        </a>

        <span className={`mode-chip ${isCloud ? 'cloud' : ''}`}>
          <span className="status-dot" />
          {isCloud ? 'Общие подарки' : 'Демо-режим'}
        </span>
      </header>

      <section className="hero">
        <div className="eyebrow">
          <Sparkles size={13} />
          МАЛЕНЬКИЙ ПОВОД УЛЫБНУТЬСЯ
        </div>

        <h1>
          Подари ей цветы.
          <br />
          <em>Даже на расстоянии.</em>
        </h1>

        <p>
          Собери виртуальный букет, добавь пару слов
          и отправь ей секретный код.
        </p>

        <div
          className={`flower-stage ${flowerId === 'roses' ? 'rose-stage' : ''}`}
          aria-label={`Букет: ${flower.name}`}
        >
          <div className="halo" />

          {flowerId === 'roses' ? (
            <div className="rose-3d-stage">
              <Rose3D />
            </div>
          ) : (
            <div className="hero-flower" key={flower.emoji}>
              {flower.emoji}
            </div>
          )}

          <span className="spark spark-one">✦</span>
          <span className="spark spark-two">✧</span>
          <span className="spark spark-three">✦</span>

          <span className="floating-heart">
            <Heart size={17} fill="currentColor" />
          </span>
        </div>
      </section>

      <section className="panel">
        <div className="tabs">
          <button
            type="button"
            className={`tab ${tab === 'make' ? 'active' : ''}`}
            onClick={() => setMode('make')}
          >
            <Heart size={16} />
            Подарить
          </button>

          <button
            type="button"
            className={`tab ${tab === 'open' ? 'active' : ''}`}
            onClick={() => setMode('open')}
          >
            <Gift size={16} />
            Получить по коду
          </button>
        </div>

        {tab === 'make' ? (
          <form onSubmit={createGift}>
            <label className="section-label">
              01 <span>Выбери букет</span>
            </label>

            <div className="flower-grid">
              {FLOWERS.map(f => (
                <button
                  type="button"
                  key={f.id}
                  className={`flower-option ${flowerId === f.id ? 'selected' : ''}`}
                  onClick={() => setFlowerId(f.id)}
                  aria-pressed={flowerId === f.id}
                >
                  <span className="flower-emoji">{f.emoji}</span>
                  <strong>{f.short}</strong>
                  <small>{f.sub}</small>

                  {flowerId === f.id && (
                    <span className="check-mark">
                      <Check size={12} />
                    </span>
                  )}
                </button>
              ))}
            </div>

            <label className="field-label" htmlFor="sender">
              02 · От кого?
            </label>

            <input
              id="sender"
              value={sender}
              onChange={e => setSender(e.target.value)}
              maxLength={40}
              placeholder="Твоё имя или подпись"
            />

            <label className="field-label" htmlFor="message">
              03 · Напиши ей что-нибудь
            </label>

            <textarea
              id="message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={240}
              placeholder="Например: Даже если я далеко, я хочу, чтобы ты улыбнулась ❤️"
            />

            <div className="counter">{message.length}/240</div>

            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}

            <button className="primary" type="submit" disabled={busy}>
              {busy ? (
                'Создаём подарок…'
              ) : (
                <>
                  Создать подарок
                  <Sparkles size={17} />
                </>
              )}
            </button>

            <p className="helper">
              После создания ты получишь код.
              Отправь его вместе со ссылкой
              на приложение.
            </p>
          </form>
        ) : (
          <form onSubmit={redeemGift}>
            <div className="open-intro">
              <span className="letter-icon">💌</span>
              <h2>У тебя подарок</h2>
              <p>Введи код, который тебе прислали.</p>
            </div>

            <label className="field-label" htmlFor="code">
              Секретный код
            </label>

            <input
              className="code-input"
              id="code"
              value={codeInput}
              onChange={e =>
                setCodeInput(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '')
                    .slice(0, 6)
                )
              }
              maxLength={6}
              placeholder="A7K9Q2"
              autoCapitalize="characters"
              autoComplete="off"
            />

            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}

            <button className="primary" type="submit" disabled={busy}>
              {busy ? (
                'Ищем подарок…'
              ) : (
                <>
                  Открыть подарок
                  <Gift size={17} />
                </>
              )}
            </button>

            <p className="helper">
              {isCloud
                ? 'Код можно открыть на любом устройстве.'
                : 'Демо-режим: код работает только в этом браузере. Подключи Supabase, чтобы делиться подарками между устройствами.'}
            </p>

            {gift && (
              <div className="gift-reveal" key={gift.code}>
                <div className="confetti" aria-hidden="true">
                  ✦　✧　✦
                </div>

                <div className="revealed-flower">
                  {gift.flower_emoji}
                </div>

                <div className="eyebrow">ЭТО ДЛЯ ТЕБЯ</div>
                <h2>{gift.flower_name}</h2>
                <p className="gift-message">{gift.message}</p>

                <p className="gift-from">
                  С теплом, от <strong>{gift.sender}</strong>
                </p>

                <div className="heart-row">♥　✦　♥</div>
              </div>
            )}
          </form>
        )}

        {tab === 'make' && createdCode && (
          <div className="created-card" id="created-card">
            <div className="success-icon">
              <Check size={22} />
            </div>

            <div className="eyebrow">ПОДАРОК СОЗДАН</div>
            <div className="created-flower">{flower.emoji}</div>
            <h2>Теперь отправь ей код</h2>

            <p className="helper">
              {isCloud
                ? 'Подарок сохранён — его можно открыть с другого устройства.'
                : 'Код сохранён в этом браузере. Для другого телефона подключи Supabase.'}
            </p>

            <div className="code-display">{createdCode}</div>

            <button
              type="button"
              className="primary"
              onClick={copyCode}
            >
              {copied ? (
                <>
                  <Check size={17} />
                  Код скопирован
                </>
              ) : (
                <>
                  <Copy size={17} />
                  Скопировать код
                </>
              )}
            </button>

            <button
              type="button"
              className="text-button"
              onClick={() => {
                setCodeInput(createdCode)
                setMode('open')
              }}
            >
              Открыть этот подарок для проверки
              <ArrowLeft size={15} />
            </button>
          </div>
        )}
      </section>

      <footer>
        <Flower2 size={14} />
        Сделано, чтобы дарить внимание
        <span>·</span>
        <Sun size={14} />
      </footer>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
