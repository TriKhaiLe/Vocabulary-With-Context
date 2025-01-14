* Đối tượng sử dụng app: App học tiếng Anh cho người Việt
* Kỹ thuật chính: Học từ vựng tiếng anh với context được thay đổi khi ôn tập
* Công nghệ: PWA, Reactjs, Firestore
** Tab danh nhập từ vựng:
+ Khi mở app, màn hình sẽ hiển thị tab nhập từ vựng. Tab này gồm 4 textbox và 2 button. Người dùng được yêu cầu nhập một câu tiếng anh và nhập từ vựng cần học trong câu đó vào 2 textbox đầu tiên (báo lỗi nếu không tìm thấy từ đó trong câu). Có một nút "Dịch" để khi user bấm vào, ứng dụng sẽ gọi API Gemini để dịch và hiển thị nghĩa của từ vựng đó và nghĩa của câu đó lên 2 textbox khác phía bên dưới, user có thể chỉnh sửa lại nếu muốn. Một button nữa có chức năng thực hiện lưu bộ dữ liệu vào database. Ứng với mỗi từ vựng cần lưu bộ data gồm: từ vựng đó, nghĩa của từ vựng, context, nghĩa của câu context đó.
** Tab ôn tập từ vựng:
+ Khi bắt đầu ôn tập ở tab ôn tập, ứng dụng sẽ đưa ra câu tiếng anh bị đục lỗ từ vựng cần học, nếu người dùng chọn đúng, hiển thị nghĩa tiếng việt của câu đó và cộng điểm thưởng. Màn hình có checkbox ứng với mỗi từ vựng, có chức năng: Thêm từ vựng này vào danh sách đổi context.
** Tab trang cá nhận kèm danh sách từ vựng:
+ Hiển thị tổng điểm của user
+ Hiển thị DS từ vựng theo bảng chữ cái
+ Mỗi item gồm từ vựng, nghĩa tiếng việt, checkbox đổi context.
+ Nút đổi context được floating và luôn nằm ở góc phải dưới để có thể di chuyển theo khi cuộn. Khi ấn nút này tiến hành đổi context cho các từ vựng đó bằng API Gemini.

** Tab đăng ký, đăng nhập cơ bản: sử dụng Firebase Authentication cho phép tạo tài khoản bằng email hoặc số điện thoại



. 


