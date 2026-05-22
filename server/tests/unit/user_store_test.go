package unit

import (
	"testing"
	"githhub.com/logic-gate-sys/tares-cli/server/internals/store"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCreateUser(t *testing.T) {
	db := SetupTestDB(t)
	defer db.Close()
    userStore :=store.NewPostgresUserStore(db)

	// Table test  
    tests := []struct {
        name    string
        user    *store.Users
        wantErr bool
    }{
        {
            name: "Valid user with multiple rooms",
            user: &store.Users{
                Email:      "jjk@gmail.com",
                FirstName:  "Daniel",
                MiddleName: "Doe",
                LastName:   "JK",
                Bio:        "I am a backend developer.",
                Rooms: []store.Room{
                    {RoomName: "Json rob", IsOccupied: true},
                    {RoomName: "Foundry Lab", IsOccupied: true},
                },
            },
            wantErr: false,
        },
        {
            name: "User with no rooms",
            user: &store.Users{
                Email:      "minimalist@example.com",
                FirstName:  "Jane",
                LastName:   "Smith",
                Bio:        "I prefer empty spaces.",
                Rooms:      []store.Room{},
            },
            wantErr: false,
        },
        {
            name: "User with empty bio and occupied room",
            user: &store.Users{
                Email:      "ghost@service.com",
                FirstName:  "Sam",
                LastName:   "Unknown",
                Bio:        "", // Testing empty string handling
                Rooms: []store.Room{
                    {RoomName: "Silent Room", IsOccupied: true},
                },
            },
            wantErr: false,
        },
        {
            name: "Invalid email format",
            user: &store.Users{
                Email:      "invalid-email-format",
                FirstName:  "Bad",
                LastName:   "Entry",
                Rooms:      []store.Room{},
            },
            wantErr: true, // This case now tests your error handling
        },
    }

    // test iteration 
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			createdUser, err := userStore.CreateUser(tt.user)
			if tt.wantErr{
               assert.Error(t, err)
			   return 
			}
			// This error
			require.NoError(t, err)
			assert.Equal(t, tt.user.UserName, createdUser.UserName)
			
			retrieved, err := userStore.GetUserById(int64(createdUser.ID))
			require.NoError(t, err)

			assert.Equal(t, createdUser.ID, retrieved.ID)
			assert.Equal(t, len(tt.user.Rooms), len(retrieved.Rooms))

		})
	}
}

