package store

type Repository interface {
   Save(file []byte) error
   Get(id string) ([]byte, error)
}
