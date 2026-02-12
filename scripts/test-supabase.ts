import { supabase } from '../lib/supabase'

async function testConnection() {
    console.log('Testing Supabase connection...\n')

    // Test 1: Check if we can connect
    try {
        const { data, error } = await supabase
            .from('medical_records')
            .select('count')
            .limit(1)

        if (error) {
            console.error('❌ Connection failed:', error.message)
            return
        }

        console.log('✅ Supabase connection successful!')
        console.log('   Database is accessible\n')

    } catch (err) {
        console.error('❌ Connection error:', err)
        return
    }

    // Test 2: Count records
    const { count } = await supabase
        .from('medical_records')
        .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Current records in database: ${count || 0}\n`)

    // Test 3: Insert a test record
    console.log('📝 Inserting test record...')
    const testRecord = {
        user_id: 'test-user-123',
        original_filename: 'test_lab_report.pdf',
        file_type: 'lab_report' as const,
        ipfs_cid: 'QmTestHash123456789',
        encrypted_symmetric_key: 'test-encrypted-key',
        access_conditions: { type: 'owner_only' },
        tags: ['test', 'lab', 'blood'],
        document_date: new Date().toISOString().split('T')[0],
    }

    const { data: insertedData, error: insertError } = await supabase
        .from('medical_records')
        .insert(testRecord)
        .select()
        .single()

    if (insertError) {
        console.error('❌ Insert failed:', insertError.message)
        console.log('   (This is expected if RLS policies require authenticated user)\n')
    } else {
        console.log('✅ Test record inserted successfully!')
        console.log('   ID:', insertedData?.id)
        console.log('   Filename:', insertedData?.original_filename, '\n')

        // Test 4: Query the record back
        console.log('🔍 Querying records...')
        const { data: records, error: queryError } = await supabase
            .from('medical_records')
            .select('*')
            .eq('user_id', 'test-user-123')

        if (queryError) {
            console.error('❌ Query failed:', queryError.message)
        } else {
            console.log('✅ Query successful!')
            console.log('   Found', records?.length, 'record(s)')
            records?.forEach(r => {
                console.log(`   - ${r.original_filename} (${r.file_type})`)
            })
        }

        // Test 5: Cleanup - delete test record
        console.log('\n🧹 Cleaning up test data...')
        const { error: deleteError } = await supabase
            .from('medical_records')
            .delete()
            .eq('user_id', 'test-user-123')

        if (deleteError) {
            console.error('❌ Cleanup failed:', deleteError.message)
        } else {
            console.log('✅ Test data cleaned up!')
        }
    }

    console.log('\n✅ All tests completed!')
}

testConnection()
