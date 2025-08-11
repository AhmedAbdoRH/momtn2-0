```python
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import os
import copy

# محرر صور بسيط واحترافي باستخدام Tkinter + PIL
# - الاقتصاص يتم مباشرة عند الضغط على "تطبيق" (الزر يتبدل من "الاقتصاص" إلى "تطبيق")
# - دعم لنسب الأبعاد الشائعة لتسهيل الاقتصاص
# - التدوير: اضغط R لتدوير 90° (بما أنه طلبت عدم وجود زر تدوير منفصل)
# - تراجع: Ctrl+Z
# - حفظ وإعادة تعيين وفتح صورة
# - واجهة مرتبة مع إنذار وتعليمات للمستخدم

class ImageEditor:
    def __init__(self, root):
        self.root = root
        self.root.title("محرر الصور — اقتصاص سريع ومباشر")
        self.root.geometry("1000x700")
        self.root.configure(bg="#0b1220")

        # حالة الصورة
        self.image_path = None
        self.original_image = None       # الصورة الأصلية كما تم تحميلها
        self.current_image = None        # نسخة العمل (PIL.Image)
        self.history = []                # لسجل التراجع

        # حالة العرض
        self.display_photo = None        # ImageTk.PhotoImage الحالية
        self.display_scale = 1.0         # مقياس العرض (display pixels per source pixel)
        self.offset_x = 0                # موضع رسم الصورة داخل الكانفس (x)
        self.offset_y = 0                # موضع رسم الصورة داخل الكانفس (y)

        # حالة التفاعل
        self.crop_mode = False
        self.dragging_image = False
        self.drag_start = (0, 0)

        # حالة الاقتصاص
        self.selection = None            # {x1,y1,x2,y2} بإحداثيات الكانفس
        self.dragging_selection = False  # أثناء السحب لإنشاء selection
        self.resizing_selection = False  # أثناء السحب لتعديل المقابض
        self.moving_selection = False    # سحب المستطيل لنقله
        self.active_handle = None        # 'nw','ne','se','sw'

        # عناصر الواجهة
        self._build_ui()

        # اختصارات لوحة المفاتيح
        self.root.bind('<r>', lambda e: self.rotate_90())
        self.root.bind('<R>', lambda e: self.rotate_90())
        self.root.bind('<Control-z>', lambda e: self.undo())
        self.root.bind('<Escape>', lambda e: self.cancel_crop())

        # إعادة رسم عندما يتغير حجم النافذة
        self.root.bind('<Configure>', lambda e: self._on_root_configure())

    def _build_ui(self):
        # شريط الأدوات العلوي
        toolbar = tk.Frame(self.root, bg="#071025")
        toolbar.pack(fill='x', side='top')

        btn_open = tk.Button(toolbar, text="فتح‎", command=self.open_image, bg="#0f172a", fg='white')
        btn_open.pack(side='left', padx=6, pady=6)

        # زر الاقتصاص (يتبدل إلى "تطبيق" عند الدخول في الوضع)
        self.btn_crop = tk.Button(toolbar, text="✂ الاقتصاص", command=self.toggle_crop_mode, bg="#0f172a", fg='white')
        self.btn_crop.pack(side='left', padx=6, pady=6)

        btn_undo = tk.Button(toolbar, text="↶ تراجع (Ctrl+Z)", command=self.undo, bg="#0f172a", fg='white')
        btn_undo.pack(side='left', padx=6, pady=6)

        btn_reset = tk.Button(toolbar, text="⟲ إعادة", command=self.reset_image, bg="#0f172a", fg='white')
        btn_reset.pack(side='left', padx=6, pady=6)

        btn_save = tk.Button(toolbar, text="💾 حفظ", command=self.save_image, bg="#3b82f6", fg='white')
        btn_save.pack(side='right', padx=6, pady=6)

        # كانفس لعرض الصورة
        self.canvas = tk.Canvas(self.root, bg='#071025', cursor='arrow')
        self.canvas.pack(fill='both', expand=True, padx=8, pady=(8,4))

        # إطار لأزرار نسب الأبعاد (يظهر فقط في وضع الاقتصاص)
        self.aspect_frame = tk.Frame(self.root, bg="#071025")
        tk.Label(self.aspect_frame, text="نسبة الأبعاد:", bg="#071025", fg='white').pack(side='left', padx=6)
        btn_original = tk.Button(self.aspect_frame, text="أصلي", command=lambda: self.handle_set_aspect('original'), bg="#0f172a", fg='white')
        btn_original.pack(side='left', padx=3)
        btn_1_1 = tk.Button(self.aspect_frame, text="1:1", command=lambda: self.handle_set_aspect(1), bg="#0f172a", fg='white')
        btn_1_1.pack(side='left', padx=3)
        btn_4_3 = tk.Button(self.aspect_frame, text="4:3", command=lambda: self.handle_set_aspect(4/3), bg="#0f172a", fg='white')
        btn_4_3.pack(side='left', padx=3)
        btn_3_4 = tk.Button(self.aspect_frame, text="3:4", command=lambda: self.handle_set_aspect(3/4), bg="#0f172a", fg='white')
        btn_3_4.pack(side='left', padx=3)
        btn_16_9 = tk.Button(self.aspect_frame, text="16:9", command=lambda: self.handle_set_aspect(16/9), bg="#0f172a", fg='white')
        btn_16_9.pack(side='left', padx=3)
        btn_9_16 = tk.Button(self.aspect_frame, text="9:16", command=lambda: self.handle_set_aspect(9/16), bg="#0f172a", fg='white')
        btn_9_16.pack(side='left', padx=3)

        # شريط الحالة أسفل
        self.status = tk.Label(self.root, text='افتح صورة للبدء — اضغط ✂ للقص ثم اضبط واسحب. R للتدوير 90°', anchor='w', bg="#071025", fg='white')
        self.status.pack(fill='x', side='bottom')

        # أحداث الفأرة على الكانفس
        self.canvas.bind('<ButtonPress-1>', self._on_mouse_down)
        self.canvas.bind('<B1-Motion>', self._on_mouse_move)
        self.canvas.bind('<ButtonRelease-1>', self._on_mouse_up)

    # --- وظائف فتح/حفظ/إعادة/تراجع ---
    def open_image(self):
        path = filedialog.askopenfilename(filetypes=[('Image files', '*.png;*.jpg;*.jpeg;*.bmp;*.gif')])
        if not path:
            return
        try:
            img = Image.open(path).convert('RGBA')
        except Exception as e:
            messagebox.showerror('خطأ', f'تعذر فتح الصورة: {e}')
            return
        self.image_path = path
        self.original_image = img.copy()
        self.current_image = img.copy()
        self.history = []
        # إعادة الإزاحة والمقياس
        self.offset_x = None
        self.offset_y = None
        self.selection = None
        self.crop_mode = False
        self.btn_crop.config(text="✂ الاقتصاص")
        self.aspect_frame.pack_forget()
        self._update_display_image()
        self.status.config(text='الصورة محمّلة. اضغط ✂ للاقتصاص أو R للتدوير.')

    def save_image(self):
        if not self.current_image:
            messagebox.showinfo('حفظ', 'لا توجد صورة للحفظ.')
            return
        initial = os.path.splitext(os.path.basename(self.image_path or 'edited'))[0]
        save_path = filedialog.asksaveasfilename(defaultextension='.png', initialfile=f'{initial}_edited.png', filetypes=[('PNG', '*.png'), ('JPEG', '*.jpg;*.jpeg')])
        if not save_path:
            return
        try:
            # نحفظ نسخة RGB إذا كانت JPEG
            ext = os.path.splitext(save_path)[1].lower()
            if ext in ('.jpg', '.jpeg'):
                rgb = self.current_image.convert('RGB')
                rgb.save(save_path, quality=92)
            else:
                self.current_image.save(save_path)
            self.status.config(text=f'تم الحفظ: {save_path}')
        except Exception as e:
            messagebox.showerror('خطأ', f'فشل الحفظ: {e}')

    def reset_image(self):
        if not self.original_image:
            return
        self.current_image = self.original_image.copy()
        self.history = []
        self.selection = None
        self.crop_mode = False
        self.btn_crop.config(text="✂ الاقتصاص")
        self.aspect_frame.pack_forget()
        self.offset_x = None
        self.offset_y = None
        self._update_display_image()
        self.status.config(text='تمت إعادة الصورة للأصلية.')

    def undo(self):
        if not self.history:
            self.status.config(text='لا يوجد شيء للتراجع عنه.')
            return
        self.current_image = self.history.pop()
        self.selection = None
        self.crop_mode = False
        self.btn_crop.config(text="✂ الاقتصاص")
        self.aspect_frame.pack_forget()
        self._update_display_image()
        self.status.config(text='تم التراجع.')

    # --- وضع الاقتصاص ---
    def toggle_crop_mode(self):
        if not self.current_image:
            self.status.config(text='افتح صورة أولاً.')
            return
        if self.crop_mode:
            # تطبيق الاقتصاص
            if self.selection:
                x1, y1, x2, y2 = self.selection['x1'], self.selection['y1'], self.selection['x2'], self.selection['y2']
                if abs(x2 - x1) < 10 or abs(y2 - y1) < 10:
                    self.status.config(text='المنطقة صغيرة جدًا للاقتصاص.')
                else:
                    img_x1, img_y1 = self._canvas_to_image_coords(min(x1, x2), min(y1, y2))
                    img_x2, img_y2 = self._canvas_to_image_coords(max(x1, x2), max(y1, y2))
                    self.history.append(self.current_image.copy())
                    try:
                        cropped = self.current_image.crop((img_x1, img_y1, img_x2, img_y2))
                        self.current_image = cropped
                        self.offset_x = None
                        self.offset_y = None
                        self._update_display_image()
                        self.status.config(text='تم الاقتصاص.')
                    except Exception as e:
                        messagebox.showerror('خطأ', f'فشل الاقتصاص: {e}')
            self.crop_mode = False
            self.selection = None
            self.canvas.config(cursor='arrow')
            self.btn_crop.config(text="✂ الاقتصاص")
            self.aspect_frame.pack_forget()
        else:
            self.crop_mode = True
            self.resizing_selection = False
            self.moving_selection = False
            self.dragging_selection = False
            self.active_handle = None
            # تحديد منطقة افتراضية تغطي الصورة
            disp_w = int(self.current_image.width * self.display_scale)
            disp_h = int(self.current_image.height * self.display_scale)
            sel_x1 = self.offset_x
            sel_y1 = self.offset_y
            sel_x2 = self.offset_x + disp_w
            sel_y2 = self.offset_y + disp_h
            self.selection = {'x1': sel_x1, 'y1': sel_y1, 'x2': sel_x2, 'y2': sel_y2}
            self._draw_overlay()
            self.canvas.config(cursor='cross')
            self.btn_crop.config(text="✔ تطبيق")
            self.aspect_frame.pack(fill='x', after=self.canvas, before=self.status)
            self.status.config(text='وضع الاقتصاص مفعل: اسحب المقابض أو المنطقة. اضغط تطبيق للاقتصاص. ESC لإلغاء.')

    def cancel_crop(self):
        if self.crop_mode:
            self.crop_mode = False
            self.selection = None
            self._update_display_image()
            self.canvas.config(cursor='arrow')
            self.btn_crop.config(text="✂ الاقتصاص")
            self.aspect_frame.pack_forget()
            self.status.config(text='تم إلغاء وضع القص.')

    # --- ضبط نسبة الأبعاد ---
    def handle_set_aspect(self, ratio):
        if not self.crop_mode or not self.selection:
            return
        if ratio == 'original':
            ratio = self.current_image.width / self.current_image.height
        # حساب حدود الصورة على الكانفس
        img_x1 = self.offset_x
        img_y1 = self.offset_y
        disp_w = self.current_image.width * self.display_scale
        disp_h = self.current_image.height * self.display_scale
        img_x2 = img_x1 + disp_w
        img_y2 = img_y1 + disp_h
        max_w = img_x2 - img_x1
        max_h = img_y2 - img_y1

        # مركز الحالي
        center_x = (self.selection['x1'] + self.selection['x2']) / 2
        center_y = (self.selection['y1'] + self.selection['y2']) / 2
        current_w = abs(self.selection['x2'] - self.selection['x1'])
        current_h = abs(self.selection['y2'] - self.selection['y1'])

        # حساب الأبعاد الجديدة مع الحفاظ على النسبة والحد الأقصى
        new_w = current_w
        new_h = new_w / ratio
        if new_h > current_h:
            new_h = current_h
            new_w = new_h * ratio
        # التحقق من الحد الأقصى
        if new_w > max_w:
            new_w = max_w
            new_h = new_w / ratio
        if new_h > max_h:
            new_h = max_h
            new_w = new_h * ratio

        # تحديد الموقع الجديد
        x1 = center_x - new_w / 2
        y1 = center_y - new_h / 2
        x2 = x1 + new_w
        y2 = y1 + new_h

        # تقليم داخل حدود الصورة
        x1 = max(img_x1, min(img_x2 - new_w, x1))
        y1 = max(img_y1, min(img_y2 - new_h, y1))
        x2 = x1 + new_w
        y2 = y1 + new_h

        self.selection = {'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2}
        self._draw_overlay()

    # --- تحويل الصورة لتناسب الكانفس ورسمها ---
    def _update_display_image(self):
        if not self.current_image:
            self.canvas.delete('all')
            return

        # نحدّد مساحة الرسم الحالية
        self.canvas.update_idletasks()
        canvas_w = max(self.canvas.winfo_width(), 600)
        canvas_h = max(self.canvas.winfo_height(), 400)
        self.canvas.config(width=canvas_w, height=canvas_h)

        # مقياس العرض لكي تناسب الصورة منطقة العرض
        self.display_scale = min(canvas_w / self.current_image.width, canvas_h / self.current_image.height, 1.0)
        disp_w = max(1, int(self.current_image.width * self.display_scale))
        disp_h = max(1, int(self.current_image.height * self.display_scale))

        # صورة مصغرة للعرض
        disp_image = self.current_image.resize((disp_w, disp_h), Image.LANCZOS)
        self.display_photo = ImageTk.PhotoImage(disp_image)

        # إذا لم يتم تحديد الإزاحة نركّز الصورة
        if self.offset_x is None or self.offset_y is None:
            self.offset_x = (canvas_w - disp_w) // 2
            self.offset_y = (canvas_h - disp_h) // 2

        # رسم الخلفية ثم الصورة
        self.canvas.delete('all')
        self.canvas.create_rectangle(0, 0, canvas_w, canvas_h, fill='#071025', outline='')
        self.canvas.create_image(self.offset_x, self.offset_y, anchor='nw', image=self.display_photo, tags=('image',))

        # رسم أي عناصر تراكب (selection)
        self._draw_overlay()

    def _draw_overlay(self):
        # يحذف التراكبات القديمة
        self.canvas.delete('overlay')
        if not self.selection:
            return
        x1, y1, x2, y2 = self.selection['x1'], self.selection['y1'], self.selection['x2'], self.selection['y2']
        # مستطيل منقّط
        self.canvas.create_rectangle(min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2), outline='white', width=2, dash=(6,4), tags=('overlay',))
        # مقابض مربعة عند الزوايا
        handle_size = 14  # كبير لسهولة اللمس والاستجابة
        corners = [ (min(x1,x2), min(y1,y2), 'nw'), (max(x1,x2), min(y1,y2), 'ne'), (max(x1,x2), max(y1,y2), 'se'), (min(x1,x2), max(y1,y2), 'sw') ]
        for (cx, cy, tag) in corners:
            self.canvas.create_rectangle(cx-handle_size//2, cy-handle_size//2, cx+handle_size//2, cy+handle_size//2, fill='white', outline='black', tags=('overlay',))

    # --- تحويل إحداثيات الكانفس -> إحداثيات الصورة الأصلية ---
    def _canvas_to_image_coords(self, cx, cy):
        if not self.current_image:
            return None
        ix = (cx - self.offset_x) / self.display_scale
        iy = (cy - self.offset_y) / self.display_scale
        ix = max(0, min(self.current_image.width - 1, ix))
        iy = max(0, min(self.current_image.height - 1, iy))
        return (int(ix), int(iy))

    # --- أحداث الفأرة ---
    def _on_mouse_down(self, event):
        x, y = event.x, event.y
        if not self.current_image:
            return

        # إذا كنا في وضع القص: تعامل مع المقابض أو التحريك أو بدء جديد (لكن مع افتراضي، نادر)
        if self.crop_mode:
            handle = self._get_handle_at(x, y)
            if handle:
                self.resizing_selection = True
                self.active_handle = handle
                self.drag_start = (x, y)
                return
            if self._point_in_selection(x, y):
                self.moving_selection = True
                self.drag_start = (x, y)
                return
            # إذا خارج، بدء سحب جديد
            self.dragging_selection = True
            self.selection = {'x1': x, 'y1': y, 'x2': x, 'y2': y}
            self._draw_overlay()
            return

        # خارج وضع القص: سحب الصورة
        if self._point_on_image(x, y):
            self.dragging_image = True
            self.drag_start = (x, y)
            self.canvas.config(cursor='fleur')

    def _on_mouse_move(self, event):
        x, y = event.x, event.y
        if not self.current_image:
            return

        # حساب حدود الصورة
        img_x1 = self.offset_x
        img_y1 = self.offset_y
        disp_w = self.current_image.width * self.display_scale
        disp_h = self.current_image.height * self.display_scale
        img_x2 = img_x1 + disp_w
        img_y2 = img_y1 + disp_h

        if self.crop_mode:
            # تغيير المؤشر
            if not (self.dragging_selection or self.resizing_selection or self.moving_selection):
                handle = self._get_handle_at(x, y)
                if handle in ('nw', 'se'):
                    self.canvas.config(cursor='nwse-resize')
                elif handle in ('ne', 'sw'):
                    self.canvas.config(cursor='nesw-resize')
                elif self._point_in_selection(x, y):
                    self.canvas.config(cursor='move')
                else:
                    self.canvas.config(cursor='cross')

            if self.dragging_selection:
                self.selection['x2'] = x
                self.selection['y2'] = y
                # ترتيب وتقليم داخل الصورة
                x1 = min(self.selection['x1'], self.selection['x2'])
                y1 = min(self.selection['y1'], self.selection['y2'])
                x2 = max(self.selection['x1'], self.selection['x2'])
                y2 = max(self.selection['y1'], self.selection['y2'])
                x1 = max(img_x1, x1)
                y1 = max(img_y1, y1)
                x2 = min(img_x2, x2)
                y2 = min(img_y2, y2)
                self.selection = {'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2}
                self._draw_overlay()
                return

            if self.resizing_selection and self.active_handle:
                x1 = self.selection['x1']
                y1 = self.selection['y1']
                x2 = self.selection['x2']
                y2 = self.selection['y2']
                if self.active_handle == 'nw':
                    x1 = x
                    y1 = y
                elif self.active_handle == 'ne':
                    x2 = x
                    y1 = y
                elif self.active_handle == 'se':
                    x2 = x
                    y2 = y
                elif self.active_handle == 'sw':
                    x1 = x
                    y2 = y
                # ترتيب وتقليم
                min_x, max_x = min(x1, x2), max(x1, x2)
                min_y, max_y = min(y1, y2), max(y1, y2)
                min_x = max(img_x1, min_x)
                min_y = max(img_y1, min_y)
                max_x = min(img_x2, max_x)
                max_y = min(img_y2, max_y)
                # الحد الأدنى للحجم
                if max_x - min_x < 10:
                    max_x = min_x + 10
                if max_y - min_y < 10:
                    max_y = min_y + 10
                self.selection = {'x1': min_x, 'y1': min_y, 'x2': max_x, 'y2': max_y}
                self._draw_overlay()
                return

            if self.moving_selection:
                dx = x - self.drag_start[0]
                dy = y - self.drag_start[1]
                width = self.selection['x2'] - self.selection['x1']
                height = self.selection['y2'] - self.selection['y1']
                new_x1 = self.selection['x1'] + dx
                new_y1 = self.selection['y1'] + dy
                # تقليم داخل الصورة
                new_x1 = max(img_x1, min(img_x2 - width, new_x1))
                new_y1 = max(img_y1, min(img_y2 - height, new_y1))
                self.selection['x1'] = new_x1
                self.selection['y1'] = new_y1
                self.selection['x2'] = new_x1 + width
                self.selection['y2'] = new_y1 + height
                self.drag_start = (x, y)
                self._draw_overlay()
                return

        # سحب الصورة
        if self.dragging_image:
            dx = x - self.drag_start[0]
            dy = y - self.drag_start[1]
            self.offset_x += dx
            self.offset_y += dy
            self.drag_start = (x, y)
            self._update_display_image()

    def _on_mouse_up(self, event):
        if not self.current_image:
            return

        if self.crop_mode:
            self.dragging_selection = False
            self.resizing_selection = False
            self.moving_selection = False
            self.active_handle = None
            # لا تطبيق هنا، التطبيق عند الزر
            return

        if self.dragging_image:
            self.dragging_image = False
            self.canvas.config(cursor='arrow')

    # --- أدوات مساعدة ---
    def _point_on_image(self, x, y):
        canvas_x = x - self.offset_x
        canvas_y = y - self.offset_y
        if canvas_x < 0 or canvas_y < 0:
            return False
        disp_w = int(self.current_image.width * self.display_scale)
        disp_h = int(self.current_image.height * self.display_scale)
        return canvas_x <= disp_w and canvas_y <= disp_h

    def _point_in_selection(self, x, y):
        if not self.selection:
            return False
        x1, y1, x2, y2 = self.selection['x1'], self.selection['y1'], self.selection['x2'], self.selection['y2']
        return min(x1, x2) <= x <= max(x1, x2) and min(y1, y2) <= y <= max(y1, y2)

    def _get_handle_at(self, x, y):
        if not self.selection:
            return None
        x1, y1, x2, y2 = self.selection['x1'], self.selection['y1'], self.selection['x2'], self.selection['y2']
        min_x, max_x = min(x1, x2), max(x1, x2)
        min_y, max_y = min(y1, y2), max(y1, y2)
        handle_size = 18
        corners = {
            'nw': (min_x, min_y),
            'ne': (max_x, min_y),
            'se': (max_x, max_y),
            'sw': (min_x, max_y),
        }
        for name, (hx, hy) in corners.items():
            if abs(x - hx) <= handle_size / 2 and abs(y - hy) <= handle_size / 2:
                return name
        return None

    # --- تدوير الصورة 90 درجة ---
    def rotate_90(self):
        if not self.current_image:
            return
        self.history.append(self.current_image.copy())
        self.current_image = self.current_image.rotate(-90, expand=True)
        self.crop_mode = False
        self.selection = None
        self.btn_crop.config(text="✂ الاقتصاص")
        self.aspect_frame.pack_forget()
        self.offset_x = None
        self.offset_y = None
        self._update_display_image()
        self.status.config(text='تم التدوير 90°')

    # --- إعادة هيكلة العرض عند تغيير حجم النافذة ---
    def _on_root_configure(self):
        if self.current_image:
            self._update_display_image()


if __name__ == '__main__':
    root = tk.Tk()
    app = ImageEditor(root)
    root.mainloop()
```
