
import './style.css'

// Interface
interface Task {
  id: number
  title: string
  course: string
  deadline: string
  status: TaskStatus
}

// Type alias dan union type
type TaskStatus = 'Belum Selesai' | 'Selesai'

// Array
let tasks: Task[] = loadData<Task[]>('taskku', [
  {
    id: 1,
    title: 'Membuat aplikasi web',
    course: 'Pengembangan Aplikasi Web',
    deadline: '2026-11-20',
    status: 'Belum Selesai'
  },
  {
    id: 2,
    title: 'Mengerjakan laporan basis data',
    course: 'Basis Data',
    deadline: '2026-11-22',
    status: 'Selesai'
  }
])

// Generic function
function loadData<T>(key: string, fallback: T): T {
  const saved = localStorage.getItem(key)
  return saved ? JSON.parse(saved) as T : fallback
}

// Primitive types
const appName: string = import.meta.env.VITE_APP_NAME || 'TaskKu'
const appVersion: string = import.meta.env.VITE_APP_VERSION || '1.0.0'
let isEditing: boolean = false
let editingId: number | null = null

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) throw new Error('Elemen aplikasi tidak ditemukan')

function saveTasks(): void {
  localStorage.setItem('taskku', JSON.stringify(tasks))
}

function render(): void {
  const completed: number = tasks.filter(t => t.status === 'Selesai').length
  const unfinished: number = tasks.length - completed

  app!.innerHTML = `
    <header class="header">
      <div>
        <h1>📚 ${appName}</h1>
        <p>Kelola tugas kuliahmu dengan lebih mudah.</p>
      </div>
      <span class="version">v${appVersion}</span>
    </header>

    <main class="container">
      <section class="stats">
        <div class="stat-card">
          <span>Total Tugas</span>
          <strong>${tasks.length}</strong>
        </div>
        <div class="stat-card">
          <span>Belum Selesai</span>
          <strong>${unfinished}</strong>
        </div>
        <div class="stat-card">
          <span>Selesai</span>
          <strong>${completed}</strong>
        </div>
      </section>

      <section class="form-card">
        <h2>${isEditing ? 'Edit Tugas' : 'Tambah Tugas Baru'}</h2>
        <form id="task-form">
          <input id="title" placeholder="Nama tugas..." required />
          <input id="course" placeholder="Nama mata kuliah..." required />
          <input id="deadline" type="date" required />
          <button type="submit">${isEditing ? 'Simpan Perubahan' : '+ Tambah Tugas'}</button>
          ${isEditing ? '<button type="button" id="cancel">Batal</button>' : ''}
        </form>
      </section>

      <section class="list-card">
        <h2>Daftar Tugas Kuliah</h2>
        <div id="task-list">
          ${tasks.length === 0 ? '<p class="empty">Belum ada tugas. Yuk tambahkan!</p>' :
            tasks.map(task => `
              <article class="task-item">
                <div class="task-info">
                  <h3>${escapeHTML(task.title)}</h3>
                  <p>${escapeHTML(task.course)}</p>
                  <small>Deadline: ${escapeHTML(task.deadline)}</small>
                  <span class="status ${task.status === 'Selesai' ? 'done' : 'pending'}">
                    ${task.status}
                  </span>
                </div>
                <div class="actions">
                  <button class="edit" data-edit="${task.id}">Edit</button>
                  <button class="toggle" data-toggle="${task.id}">
                    ${task.status === 'Selesai' ? 'Batalkan' : 'Selesaikan'}
                  </button>
                  <button class="delete" data-delete="${task.id}">Hapus</button>
                </div>
              </article>
            `).join('')
          }
        </div>
      </section>
    </main>

    <footer>TaskKu © 2026 | Dibuat dengan TypeScript & Vite</footer>
  `

  const form = document.querySelector<HTMLFormElement>('#task-form')!

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const title = (document.querySelector<HTMLInputElement>('#title')!).value.trim()
    const course = (document.querySelector<HTMLInputElement>('#course')!).value.trim()
    const deadline = (document.querySelector<HTMLInputElement>('#deadline')!).value

    if (!title || !course || !deadline) return

    if (isEditing && editingId !== null) {
      tasks = tasks.map(task =>
        task.id === editingId ? { ...task, title, course, deadline } : task
      )
    } else {
      tasks.push({
        id: Date.now(),
        title,
        course,
        deadline,
        status: 'Belum Selesai'
      })
    }

    isEditing = false
    editingId = null
    saveTasks()
    render()
  })

  document.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(button => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.edit)
      const task = tasks.find(t => t.id === id)
      if (!task) return

      isEditing = true
      editingId = id
      render()

      ;(document.querySelector<HTMLInputElement>('#title')!).value = task.title
      ;(document.querySelector<HTMLInputElement>('#course')!).value = task.course
      ;(document.querySelector<HTMLInputElement>('#deadline')!).value = task.deadline
    })
  })

  document.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach(button => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.delete)
      tasks = tasks.filter(t => t.id !== id)
      saveTasks()
      render()
    })
  })

  document.querySelectorAll<HTMLButtonElement>('[data-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.toggle)
      tasks = tasks.map(task =>
        task.id === id
          ? { ...task, status: task.status === 'Selesai' ? 'Belum Selesai' : 'Selesai' }
          : task
      )
      saveTasks()
      render()
    })
  })

  document.querySelector('#cancel')?.addEventListener('click', () => {
    isEditing = false
    editingId = null
    render()
  })
}

function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]!)
}

render()
