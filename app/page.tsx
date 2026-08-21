'use client';

import { useEffect, useMemo, useState } from 'react';

type Stage = 'envelope' | 'question' | 'later' | 'main' | 'addon' | 'details' | 'time' | 'confirm' | 'done';
type ActivityId = 'walk' | 'cinema' | 'food' | 'vr';

const activities: Array<{ id: ActivityId; icon: string; title: string; text: string }> = [
  { id: 'walk', icon: '🌙', title: 'Прогулка', text: 'Погулять вдвоём и никуда не спешить' },
  { id: 'cinema', icon: '🎬', title: 'Кино: «Моана»', text: 'Устроить уютный киновечер' },
  { id: 'food', icon: '🍽️', title: 'Покушать', text: 'Выбрать что-нибудь особенно вкусное' },
  { id: 'vr', icon: '🥽', title: 'VR', text: 'Приключение в виртуальной реальности' },
];

const detailOptions: Partial<Record<ActivityId, string[]>> = {
  walk: ['Сайран', 'Ореховая роща', 'Парк за Есентаем', 'На твой выбор ❤️'],
  food: ['Паста', 'Стейк', 'Грузинская кухня', 'Лагман', 'Сладкое', 'На твой выбор ❤️'],
};

const detailTitles: Partial<Record<ActivityId, string>> = {
  walk: 'Где будем гулять?',
  food: 'Что будем кушать?',
};

function buildTodayTimeSlots() {
  const now = new Date();
  const almatyMinutes = ((now.getUTCHours() + 5) % 24) * 60 + now.getUTCMinutes();
  const start = Math.ceil((almatyMinutes + 30) / 15) * 15;
  const slots: string[] = [];
  for (let minutes = start; minutes < 24 * 60; minutes += 15) {
    slots.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  }
  return slots;
}

export default function Home() {
  const [stage, setStage] = useState<Stage>('envelope');
  const [noMoves, setNoMoves] = useState(0);
  const [primaryActivity, setPrimaryActivity] = useState<ActivityId | null>(null);
  const [addonActivity, setAddonActivity] = useState<ActivityId | null>(null);
  const [details, setDetails] = useState<Partial<Record<ActivityId, string>>>({});
  const [detailIndex, setDetailIndex] = useState(0);
  const [time, setTime] = useState('');

  const params = useMemo(() => {
    if (typeof window === 'undefined') return { name: 'Любимая', from: 'твой муж' };
    const query = new URLSearchParams(window.location.search);
    return {
      name: query.get('name')?.trim() || 'Любимая',
      from: query.get('from')?.trim() || 'твой муж',
    };
  }, []);

  const availableTimes = useMemo(() => buildTodayTimeSlots(), []);
  const selectedTime = time || availableTimes[0] || '';
  const selectedActivities = [primaryActivity, addonActivity].filter((id): id is ActivityId => Boolean(id));
  const detailQueue = selectedActivities.filter((id) => Boolean(detailOptions[id]));
  const currentDetail = detailQueue[detailIndex];
  const todayLabel = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Almaty',
  }).format(new Date());
  const ticketNumber = `LOVE-${new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Almaty' }).format(new Date()).replace('.', '')}`;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [stage]);

  function choosePrimary(id: ActivityId) {
    if (primaryActivity !== id) {
      setPrimaryActivity(id);
      setAddonActivity(null);
      setDetails({});
    }
  }

  function continueFromAddon() {
    setDetailIndex(0);
    setStage(detailQueue.length ? 'details' : 'time');
  }

  function continueFromDetails() {
    if (detailIndex < detailQueue.length - 1) setDetailIndex((value) => value + 1);
    else setStage('time');
  }

  function backFromDetails() {
    if (detailIndex > 0) setDetailIndex((value) => value - 1);
    else setStage('addon');
  }

  function backFromTime() {
    if (detailQueue.length) {
      setDetailIndex(detailQueue.length - 1);
      setStage('details');
    } else {
      setStage('addon');
    }
  }

  function getActivity(id: ActivityId) {
    return activities.find((item) => item.id === id)!;
  }

  function getActivityDetail(id: ActivityId) {
    return details[id] || '';
  }

  async function shareAnswer() {
    const choices = selectedActivities.map((id) => {
      const item = getActivity(id);
      return `${item.title}${getActivityDetail(id) ? ` — ${getActivityDetail(id)}` : ''}`;
    }).join(', ');
    const text = `Да! 💗 Сегодня в ${selectedTime}. Наш план: ${choices}.`;
    if (navigator.share) {
      await navigator.share({ title: 'Мой ответ на приглашение', text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Ответ скопирован — отправь его мужу 💌');
    }
  }

  return (
    <main className={`scene stage-${stage}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="sparkles" aria-hidden="true"><span>✦</span><span>♥</span><span>✦</span><span>♥</span><span>✦</span></div>

      <section key={stage} className="card" aria-live="polite">
        {stage === 'envelope' && (
          <div className="envelope-screen">
            <p className="eyebrow">Для тебя — с любовью</p>
            <div className="envelope" aria-label="Запечатанный конверт">
              <div className="envelope-back" />
              <div className="letter"><span>{params.name},<br />у меня для тебя<br />кое-что особенное</span></div>
              <div className="envelope-front" />
              <button className="seal" onClick={() => setStage('question')} aria-label="Открыть приглашение">♥</button>
            </div>
            <h1>Тебе пришло<br />маленькое приглашение</h1>
            <p className="hint">Нажми на печать, чтобы открыть</p>
          </div>
        )}

        {stage === 'question' && (
          <div className="content-screen question-screen">
            <div className="mini-heart">♥</div>
            <p className="eyebrow">Один очень важный вопрос</p>
            <h1>{params.name}, пойдёшь<br />со мной на свидание сегодня?</h1>
            <p className="lead">Хочу украсть тебя у всех дел и устроить вечер только для нас двоих.</p>
            <div className="answer-zone">
              <button className="primary" onClick={() => setStage('main')}>Да, с радостью 💗</button>
              <button
                className={`no-button move-${noMoves % 2}`}
                onPointerEnter={() => noMoves === 0 && setNoMoves(1)}
                onClick={() => noMoves === 0 ? setNoMoves(1) : setStage('later')}
              >{noMoves ? 'Давай в другой день' : 'Нет'}</button>
            </div>
            {noMoves > 0 && <p className="tease">Хорошо, можно выбрать другой день — без обид 💗</p>}
          </div>
        )}

        {stage === 'later' && (
          <div className="content-screen later-screen">
            <div className="big-heart soft">♥</div>
            <p className="eyebrow">Конечно, любимая</p>
            <h1>Тогда выберем<br />другой день вместе</h1>
            <p className="lead">Главное — провести время рядом. Я никуда не тороплюсь 💗</p>
            <button className="primary wide" onClick={() => setStage('question')}>Вернуться к приглашению</button>
          </div>
        )}

        {stage === 'main' && (
          <div className="content-screen plan-screen flow-screen">
            <div className="step">1 из 4</div>
            <p className="eyebrow">Главное событие вечера</p>
            <h1>Что выбираешь<br />в первую очередь?</h1>
            <p className="lead compact">Один основной вариант. На следующем шаге можно будет добавить ещё один.</p>
            <div className="plans activity-grid">
              {activities.map((item) => {
                const selected = primaryActivity === item.id;
                return (
                  <button key={item.id} className={`plan ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={() => choosePrimary(item.id)}>
                    <span className="plan-icon">{item.icon}</span>
                    <span><strong>{item.title}</strong><small>{item.text}</small></span>
                    <span className="radio">{selected ? '✓' : ''}</span>
                  </button>
                );
              })}
            </div>
            <button className="primary wide" disabled={!primaryActivity} onClick={() => setStage('addon')}>Продолжить <span>→</span></button>
            <button className="back" onClick={() => setStage('question')}>Назад</button>
          </div>
        )}

        {stage === 'addon' && primaryActivity && (
          <div className="content-screen plan-screen flow-screen">
            <div className="step">2 из 4</div>
            <p className="eyebrow">Дополнение к плану</p>
            <h1>Добавим что-нибудь<br />ещё?</h1>
            <p className="lead compact">Можно выбрать ещё один вариант или оставить только главное.</p>
            <div className="plans activity-grid">
              {activities.filter((item) => item.id !== primaryActivity).map((item) => {
                const selected = addonActivity === item.id;
                return (
                  <button key={item.id} className={`plan ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={() => setAddonActivity(selected ? null : item.id)}>
                    <span className="plan-icon">{item.icon}</span>
                    <span><strong>{item.title}</strong><small>{item.text}</small></span>
                    <span className="checkbox">{selected ? '✓' : ''}</span>
                  </button>
                );
              })}
              <button className={`plan skip-plan ${addonActivity === null ? 'selected' : ''}`} aria-pressed={addonActivity === null} onClick={() => setAddonActivity(null)}>
                <span className="plan-icon">✨</span>
                <span><strong>Только главное</strong><small>Этого вполне достаточно для хорошего вечера</small></span>
                <span className="radio">{addonActivity === null ? '✓' : ''}</span>
              </button>
            </div>
            <button className="primary wide" onClick={continueFromAddon}>Продолжить <span>→</span></button>
            <button className="back" onClick={() => setStage('main')}>Назад</button>
          </div>
        )}

        {stage === 'details' && currentDetail && (
          <div className="content-screen detail-screen flow-screen">
            <div className="step">{getActivity(currentDetail).title} · {detailIndex + 1} из {detailQueue.length}</div>
            <p className="eyebrow">Одно уточнение</p>
            <h1>{detailTitles[currentDetail]}</h1>
            <p className="lead compact">Выбери один вариант.</p>
            <div className="choice-list">
              {detailOptions[currentDetail]?.map((option) => {
                const selected = details[currentDetail] === option;
                return (
                  <button key={option} className={`choice ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={() => setDetails((current) => ({ ...current, [currentDetail]: option }))}>
                    <span>{option}</span><span className="radio">{selected ? '✓' : ''}</span>
                  </button>
                );
              })}
            </div>
            <button className="primary wide" disabled={!details[currentDetail]} onClick={continueFromDetails}>
              {detailIndex < detailQueue.length - 1 ? 'Следующее уточнение' : 'Выбрать время'} <span>→</span>
            </button>
            <button className="back" onClick={backFromDetails}>Назад</button>
          </div>
        )}

        {stage === 'time' && (
          <div className="content-screen time-screen">
            <div className="step">3 из 4</div>
            <p className="eyebrow">Свидание уже сегодня</p>
            <h1>Во сколько<br />начинаем?</h1>
            <p className="lead">Показываю только доступное время — начиная через полчаса.</p>
            {availableTimes.length ? (
              <label className="time-field">
                <span>Сегодня</span>
                <select value={selectedTime} onChange={(event) => setTime(event.target.value)} aria-label="Время начала свидания">
                  {availableTimes.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </label>
            ) : <p className="late-note">Сегодня уже не осталось свободных слотов. Давай выберем другой день 💗</p>}
            <button className="primary wide" disabled={!availableTimes.length} onClick={() => setStage('confirm')}>Проверить план <span>→</span></button>
            <button className="back" onClick={backFromTime}>Назад</button>
          </div>
        )}

        {stage === 'confirm' && (
          <div className="content-screen confirm-screen flow-screen">
            <div className="step">4 из 4</div>
            <p className="eyebrow">Почти готово</p>
            <h1>Всё верно?</h1>
            <p className="lead compact">Вот как будет выглядеть наш вечер.</p>
            <div className="plan-summary">
              <div className="summary-time"><span>Сегодня</span><strong>{selectedTime}</strong></div>
              <ol>
                {selectedActivities.map((id, index) => {
                  const item = getActivity(id);
                  return <li key={id}><span className="order">{index + 1}</span><span><b>{item.icon} {item.title}</b>{getActivityDetail(id) && <small>{getActivityDetail(id)}</small>}</span></li>;
                })}
              </ol>
            </div>
            <button className="primary wide" onClick={() => setStage('done')}>Да, получить билет 💗</button>
            <button className="back" onClick={() => setStage('time')}>Изменить время или план</button>
          </div>
        )}

        {stage === 'done' && (
          <div className="content-screen done-screen flow-screen">
            <p className="ticket-kicker">Билет № {ticketNumber}</p>
            <div className="ticket ticket-final">
              <div className="ticket-top"><span>Сегодня</span><strong>{selectedTime}</strong></div>
              <div className="perforation"><i /><i /></div>
              <div className="ticket-route">
                <span>Маршрут вечера</span>
                <ol>
                  {selectedActivities.map((id, index) => {
                    const item = getActivity(id);
                    return <li key={id}><em>{index + 1}</em><span><b>{item.icon} {item.title}</b>{getActivityDetail(id) && <small>{getActivityDetail(id)}</small>}</span></li>;
                  })}
                </ol>
              </div>
              <div className="ticket-date capitalize">{todayLabel}</div>
            </div>
            <h1 className="ticket-title">До встречи<br />сегодня вечером</h1>
            <p className="signature">Обнимаю, {params.from} 💌</p>
            <button className="primary wide" onClick={shareAnswer}>Отправить мужу 💌</button>
          </div>
        )}
      </section>

      <footer>Сделано с любовью — только для тебя</footer>
    </main>
  );
}
