package unit


import (
	"database/sql"
	"testing"

	"githhub.com/logic-gate-sys/tares-cli/server/internals/store"
	_ "github.com/jackc/pgx/v4/stdlib"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func SetupTestDB(t *testing.T) *sql.DB {
	db, err := sql.Open("pgx", "host=localhost user=postgres password=postgres dbname=postgres port=5434 sslmode=disable")
	if err != nil {
		t.Fatalf("opening test db: %v", err)
	}
	// run the migratoins for our test db
	err = store.Migrate(db, "../../")
	if err != nil {
		t.Fatalf("migrating test db error: %v", err)
	}
	_, err = db.Exec(`TRUNCATE users, workouts, workout_entries CASCADE`)
	if err != nil {
		t.Fatalf("truncating tables %v", err)
	}

	return db
}
