#![cfg(test)]
use super::*;
use soroban_sdk::{Env, BytesN, IntoVal, vec, Symbol};
use soroban_sdk::testutils::{Ledger, Events};


fn setup(env: &Env) -> TituloVerifyContractClient {
    let contract_id = env.register(TituloVerifyContract, ());
    TituloVerifyContractClient::new(env, &contract_id)
}

#[test]
fn test_record_returns_ledger_timestamp() {
    let env = Env::default();
    let client = setup(&env);
    
    // Set ledger timestamp
    env.ledger().set_timestamp(1000);
    
    let dummy_hash = BytesN::from_array(&env, &[0; 32]);
    let result = client.record(&dummy_hash);
    
    assert_eq!(result, 1000);
}

#[test]
fn test_record_emits_event() {
    let env = Env::default();
    let client = setup(&env);
    
    env.ledger().set_timestamp(1000);
    let dummy_hash = BytesN::from_array(&env, &[5; 32]);
    client.record(&dummy_hash);
    
    // Check events
    let events = env.events().all();
    assert_eq!(events.len(), 1);
    
    let event = events.get(0).unwrap();
    
    // Topic should be "verification"
    let topic: Symbol = event.1.get(0).unwrap().into_val(&env);
    assert_eq!(
        topic,
        Symbol::new(&env, "verification")
    );
    
    // Data should be (title_hash, ts)
    let event_data: (BytesN<32>, u64) = event.2.into_val(&env);
    assert_eq!(
        event_data,
        (dummy_hash, 1000u64)
    );
}
